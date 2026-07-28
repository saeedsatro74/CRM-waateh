import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  ShadingType,
  Footer,
  Header,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for Persian Digits
function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return "";
  const str = String(num);
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/\d/g, (x) => persianDigits[parseInt(x)]);
}

// Helper for Number Formatting
function formatNumber(num: number): string {
  if (isNaN(num)) return "۰";
  return new Intl.NumberFormat("fa-IR").format(num);
}

// Helper for Number to Persian Words
function numberToPersianWords(num: number | string | undefined | null, unit: string = "ریال"): string {
  if (num === undefined || num === null || isNaN(Number(num)) || Number(num) === 0) {
    return `صفر ${unit}`.trim();
  }

  let n = Math.abs(Math.floor(Number(num)));

  const yekan = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
  const dahgan10 = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
  const dahgan = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
  const sadgan = ["", "یکصد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
  const scaleNames = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

  function convertThreeDigits(number: number): string {
    const s = Math.floor(number / 100);
    const d = Math.floor((number % 100) / 10);
    const y = number % 10;

    const parts: string[] = [];

    if (s > 0) parts.push(sadgan[s]);

    if (d === 1) {
      parts.push(dahgan10[y]);
    } else {
      if (d > 1) parts.push(dahgan[d]);
      if (y > 0) parts.push(yekan[y]);
    }

    return parts.join(" و ");
  }

  const chunks: string[] = [];
  let scaleIndex = 0;

  while (n > 0) {
    const remainder = n % 1000;
    if (remainder > 0) {
      const words = convertThreeDigits(remainder);
      const scaleName = scaleNames[scaleIndex];
      chunks.unshift(scaleName ? `${words} ${scaleName}` : words);
    }
    n = Math.floor(n / 1000);
    scaleIndex++;
  }

  const result = chunks.join(" و ");
  return unit ? `${result} ${unit}`.trim() : result;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CRM Proposal Word Generation API is active" });
  });

  // API Route: Generate Word Document
  app.post("/api/generate-word", async (req, res) => {
    try {
      const {
        doc_type = "financial", // 'financial' | 'technical'
        doc_number = "WQ-1405/5009",
        date = new Date().toLocaleDateString("fa-IR"),
        customer_name = "شرکت تولیدی شیوا",
        company_name = "شرکت نهرآب سمام (واته)",
        subject = "پیشنهاد مالی چیلر ۱۲۰ تن",
        description = "با سلام و احترام\nپیرو درخواست شما، پیشنهاد قیمت به شرح ذیل اعلام می‌گردد:",
        currency = "ریال",
        items = [],
        shipping_cost = 0,
        discount_percent = 0,
        vat_percent = 10,
        notes = "",
        device_template = "chiller",
      } = req.body;

      // Calculate totals
      let subtotal = 0;
      const formattedItems = (items.length > 0 ? items : [
        {
          item_name: "چیلر اسکرال هواخنک ۱۲۰ تن نامی (۶۰ تن واقعی) - ۴ دستگاه کمپرسور COPELAND",
          model: "WACC-120-4SC",
          quantity: 1,
          unit_price: 85000000000,
        }
      ]).map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unit_price) || 0;
        const total = qty * price;
        subtotal += total;
        return {
          row_index: idx + 1,
          item_name: item.item_name || item.name || "کالا / دستگاه",
          model: item.model || "استاندارد",
          quantity: qty,
          unit_price: price,
          total_price: total,
        };
      });

      const discountAmount = Math.round((subtotal * (Number(discount_percent) || 0)) / 100);
      const netSubtotal = subtotal - discountAmount;
      const vatAmount = Math.round((netSubtotal * (Number(vat_percent) || 10)) / 100);
      const grandTotal = netSubtotal + vatAmount + (Number(shipping_cost) || 0);
      const finalWords = numberToPersianWords(grandTotal, currency);

      let doc: Document;

      if (doc_type === "technical") {
        // Technical Proposal Document
        doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  text: company_name,
                  heading: HeadingLevel.HEADING_1,
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  text: "پیشنهاد فنی و تخصصی سیستم‌های تهویه و برودتی",
                  heading: HeadingLevel.HEADING_2,
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "شماره سند فنی: ", bold: true }),
                    new TextRun({ text: toPersianDigits(doc_number) }),
                    new TextRun({ text: "   |   تاریخ: ", bold: true }),
                    new TextRun({ text: toPersianDigits(date) }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "خریدار / کارفرما: ", bold: true }),
                    new TextRun({ text: customer_name }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "موضوع استعلام: ", bold: true }),
                    new TextRun({ text: subject }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                  text: "مشخصات فنی دستگاه و تجهیزات پیشنهادی:",
                  heading: HeadingLevel.HEADING_3,
                  alignment: AlignmentType.RIGHT,
                }),
                ...formattedItems.map((it: any) => 
                  new Paragraph({
                    children: [
                      new TextRun({ text: `• ردیف ${toPersianDigits(it.row_index)}: ${it.item_name} `, bold: true }),
                      new TextRun({ text: `(مدل: ${it.model} - تعداد: ${toPersianDigits(it.quantity)} دستگاه)\n` }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  })
                ),
                new Paragraph({ text: "" }),
                new Paragraph({
                  text: "ملاحظات فنی، گارانتی و استانداردها:",
                  heading: HeadingLevel.HEADING_3,
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  text: notes || "• گارانتی: ۱۸ ماه از زمان تحویل یا ۱۲ ماه از زمان نصب و راه‌اندازی\n• کلیه محاسبات بر اساس شرایط اقلیمی کارفرما انجام شده است.",
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            },
          ],
        });
      } else {
        // Financial Proposal Document ( exact match to official company template )
        const tableHeader = new TableRow({
          children: [
            new TableCell({
              width: { size: 6, type: WidthType.PERCENTAGE },
              shading: { fill: "EA580C", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "ردیف", color: "FFFFFF", bold: true })], alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: { fill: "EA580C", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "شرح کالا", color: "FFFFFF", bold: true })], alignment: AlignmentType.RIGHT })],
            }),
            new TableCell({
              width: { size: 14, type: WidthType.PERCENTAGE },
              shading: { fill: "EA580C", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "مدل", color: "FFFFFF", bold: true })], alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              shading: { fill: "EA580C", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "تعداد", color: "FFFFFF", bold: true })], alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 16, type: WidthType.PERCENTAGE },
              shading: { fill: "EA580C", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: `قیمت واحد (${currency})`, color: "FFFFFF", bold: true })], alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 16, type: WidthType.PERCENTAGE },
              shading: { fill: "EA580C", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: `قیمت کل (${currency})`, color: "FFFFFF", bold: true })], alignment: AlignmentType.CENTER })],
            }),
          ],
        });

        const tableItemRows = formattedItems.map((it: any) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: toPersianDigits(it.row_index), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                children: [new Paragraph({ text: it.item_name, alignment: AlignmentType.RIGHT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: it.model, alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                children: [new Paragraph({ text: toPersianDigits(it.quantity), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                children: [new Paragraph({ text: toPersianDigits(formatNumber(it.unit_price)), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                children: [new Paragraph({ text: toPersianDigits(formatNumber(it.total_price)), alignment: AlignmentType.CENTER })],
              }),
            ],
          })
        );

        // Summary Rows inside Table
        const subtotalRow = new TableRow({
          children: [
            new TableCell({
              columnSpan: 5,
              shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "جمع کل : ", bold: true }),
                    new TextRun({ text: `${numberToPersianWords(subtotal, currency)} `, bold: true }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
            new TableCell({
              shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: toPersianDigits(formatNumber(subtotal)), bold: true })], alignment: AlignmentType.CENTER })],
            }),
          ],
        });

        const vatRow = new TableRow({
          children: [
            new TableCell({
              columnSpan: 5,
              shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `مالیات بر ارزش افزوده (${toPersianDigits(vat_percent)}٪)`, bold: true })],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
            new TableCell({
              shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: toPersianDigits(formatNumber(vatAmount)), bold: true })], alignment: AlignmentType.CENTER })],
            }),
          ],
        });

        const grandTotalRow = new TableRow({
          children: [
            new TableCell({
              columnSpan: 5,
              shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "جمع کل نهایی : ", bold: true, color: "0F172A" }),
                    new TextRun({ text: `${finalWords}`, bold: true, color: "0F172A" }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
            new TableCell({
              shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: toPersianDigits(formatNumber(grandTotal)), bold: true, color: "0F172A" })], alignment: AlignmentType.CENTER })],
            }),
          ],
        });

        doc = new Document({
          sections: [
            {
              properties: {},
              headers: {
                default: new Header({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "شرکت نهرآب سمام (واته)", bold: true, color: "0284C7", size: 28 }),
                        new TextRun({ text: "\nتولید کننده انواع سیستم‌های تهویه مطبوع و تبدیل انرژی", size: 18, color: "EA580C" }),
                      ],
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
              },
              footers: {
                default: new Footer({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "تلفن: (+۹۸) ۲۱ ۲۲ ۱۴ ۴۰۰۰  |  ایمیل: info@waateh.com  |  وبسایت: www.waateh.com\n", size: 16 }),
                        new TextRun({ text: "آدرس کارخانه: تهران- جاده آدران به شهریار - صباشهر - خیابان دانشگاه - بن بست یاس - پلاک ۱", size: 16 }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                }),
              },
              children: [
                // Header Meta Box
                new Paragraph({
                  children: [
                    new TextRun({ text: "شماره: ", bold: true }),
                    new TextRun({ text: toPersianDigits(doc_number) }),
                    new TextRun({ text: "   |   تاریخ: ", bold: true }),
                    new TextRun({ text: toPersianDigits(date) }),
                    new TextRun({ text: "   |   پیوست: دارد", bold: true }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "خریدار: ", bold: true }),
                    new TextRun({ text: customer_name }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "موضوع: ", bold: true }),
                    new TextRun({ text: subject }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                  text: description || "با سلام و احترام؛ به استحضار می‌رساند پیرو درخواست شما بدینوسیله پیشنهاد قیمت به شرح ذیل اعلام می‌گردد:",
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({ text: "" }),

                // Main Items Table
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [tableHeader, ...tableItemRows, subtotalRow, vatRow, grandTotalRow],
                }),

                new Paragraph({ text: "" }),
                new Paragraph({ text: "ملاحظات و شرایط پیشنهاد:", heading: HeadingLevel.HEADING_3, alignment: AlignmentType.RIGHT }),
                new Paragraph({
                  text: notes || 
                    "❖ زمان تحویل: ۶۰ روز کاری پس از تسویه پیش پرداخت و تأییدیه فنی توسط کارفرما.\n" +
                    "❖ اعتبار پیش فاکتور ۲۴ ساعت از تاریخ پیشنهاد می‌باشد.\n" +
                    "❖ نحوه پرداخت: ۵۰٪ پیش پرداخت در زمان ثبت سفارش، ۴۰٪ همزمان با تحویل کالا، ۱۰٪ پس از ارسال.\n" +
                    "❖ محل تحویل: درب انبار شرکت کارفرما در تهران.\n" +
                    "❖ گارانتی: ۱۸ ماه از زمان تحویل و ۱۲ ماه در قبال نصب و راه‌اندازی توسط کارشناس فنی شرکت.\n" +
                    "❖ فونداسیون، کانال کشی، کابل کشی و لوله کشی به عهده خریدار می‌باشد.\n" +
                    "❖ خدمات پس از فروش: تامین قطعات یدکی به مدت ۱۰ سال.",
                  alignment: AlignmentType.RIGHT,
                }),

                new Paragraph({ text: "" }),
                // Bank Account Info Box
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ text: "درصورت تأییدیه رسمی، شماره حساب این شرکت به شرح ذیل تقدیم می‌گردد:\n", bold: true }),
                                new TextRun({ text: "شماره شبا: IR370550010385006566381001\n", bold: true, color: "0284C7" }),
                                new TextRun({ text: "نزد بانک اقتصاد نوین شعبه فاطمی به نام شرکت نهرآب سمام\n", bold: true }),
                                new TextRun({ text: "لطفاً در صورت واریز وجه، کپی رسید بانک را به آدرس info@waateh.com ایمیل نمایید.", size: 16 }),
                              ],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            },
          ],
        });
      }

      const buffer = await Packer.toBuffer(doc);

      const filename = doc_type === "technical" 
        ? `Technical_Proposal_${doc_number.replace(/[\/\s]/g, "_")}.docx`
        : `Financial_Proposal_${doc_number.replace(/[\/\s]/g, "_")}.docx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.send(buffer);
    } catch (err: any) {
      console.error("Error generating Word document:", err);
      res.status(500).json({ error: "خطا در ساخت فایل وورد", details: err?.message });
    }
  });

  // Vite middleware for dev or static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM Word Proposal Generator Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
