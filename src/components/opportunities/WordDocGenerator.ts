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
  BorderStyle,
  Header,
  Footer,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';
import { Opportunity, CompanySettings } from '../../types';
import { formatTomans, toPersianDigits } from '../../lib/utils';

export async function generatePreInvoiceWordDoc(
  opportunity: Opportunity,
  companySettings?: CompanySettings,
  stampBase64?: string
) {
  const companyName = companySettings?.companyName || 'شرکت مهندسی و تجهیزات صنعتی واته';
  const companyPhone = companySettings?.phone || '۰۲۱-۶۶۵۵۴۴۳۳';
  const companyAddress = companySettings?.address || 'تهران، خیابان آزادی، پلاک ۱۲۴';

  const discount = opportunity.approvalData?.discountPercent || 0;
  const executionDays = opportunity.approvalData?.executionTimeDays || 30;
  const priceValidity = opportunity.approvalData?.priceValidityDays || 7;
  const warranty = opportunity.approvalData?.warrantyTerms || '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب (هرکدام زودتر فرا برسد)';
  
  let deliveryLoc = 'تحویل درب کارخانه';
  if (opportunity.approvalData?.deliveryLocationType === 'custom' && opportunity.approvalData.deliveryLocationCustom) {
    deliveryLoc = opportunity.approvalData.deliveryLocationCustom;
  }

  // Calculate totals
  const rawSubtotal = opportunity.items?.reduce((sum, i) => sum + (i.totalPrice || 0), 0) || opportunity.value;
  const discountAmount = Math.round((rawSubtotal * discount) / 100);
  const taxableAmount = rawSubtotal - discountAmount;
  const taxAmount = Math.round(taxableAmount * 0.1); // 10% VAT
  const grandTotal = taxableAmount + taxAmount;

  // Build items table rows
  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: 'ردیف', alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: 'شرح تجهیزات / دستگاه', alignment: AlignmentType.RIGHT })],
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: 'تعداد', alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: 'واحد', alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: 'قیمت واحد (تومان)', alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: 'قیمت کل (تومان)', alignment: AlignmentType.CENTER })],
        }),
      ],
    }),
  ];

  if (opportunity.items && opportunity.items.length > 0) {
    opportunity.items.forEach((item, index) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: toPersianDigits(index + 1), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [
                new Paragraph({ text: item.name, alignment: AlignmentType.RIGHT }),
                ...(item.specs ? [new Paragraph({ text: `مشخصات: ${item.specs}`, alignment: AlignmentType.RIGHT })] : []),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ text: toPersianDigits(item.quantity), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: item.unit || 'دستگاه', alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: toPersianDigits(formatTomans(item.unitPrice)), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: toPersianDigits(formatTomans(item.totalPrice)), alignment: AlignmentType.CENTER })],
            }),
          ],
        })
      );
    });
  } else {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: '۱', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: opportunity.title, alignment: AlignmentType.RIGHT })] }),
          new TableCell({ children: [new Paragraph({ text: '۱', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: 'دستگاه', alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: toPersianDigits(formatTomans(opportunity.value)), alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: toPersianDigits(formatTomans(opportunity.value)), alignment: AlignmentType.CENTER })] }),
        ],
      })
    );
  }

  const childrenParagraphs = [
    new Paragraph({
      text: companyName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: 'پیش‌فاکتور رسمی فروش تجهیزات و خدمات فنی',
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),

    // Invoice Meta
    new Paragraph({
      children: [
        new TextRun({ text: 'شماره پیش‌فاکتور: ', bold: true }),
        new TextRun({ text: toPersianDigits(opportunity.number || `WQ-${opportunity.id.slice(-6)}`) }),
        new TextRun({ text: '   |   تاریخ صدور: ', bold: true }),
        new TextRun({ text: toPersianDigits(new Date().toLocaleDateString('fa-IR')) }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'خریدار / خریدار محترم: ', bold: true }),
        new TextRun({ text: `${opportunity.companyName || opportunity.customerName} (${opportunity.customerName})` }),
        new TextRun({ text: '   |   شماره تماس: ', bold: true }),
        new TextRun({ text: toPersianDigits(opportunity.phone || '—') }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({ text: '' }),

    // Items Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),

    new Paragraph({ text: '' }),

    // Summary Box
    new Paragraph({
      children: [
        new TextRun({ text: `جمع کل اولیه: ${toPersianDigits(formatTomans(rawSubtotal))} تومان\n` }),
        new TextRun({ text: `درصد تخفیف مصوب: ${toPersianDigits(discount)}%\n` }),
        new TextRun({ text: `مبلغ تخفیف: ${toPersianDigits(formatTomans(discountAmount))} تومان\n` }),
        new TextRun({ text: `مالیات بر ارزش افزوده (۱۰٪): ${toPersianDigits(formatTomans(taxAmount))} تومان\n` }),
        new TextRun({ text: `مبلغ قابل پرداخت نهایی: ${toPersianDigits(formatTomans(grandTotal))} تومان`, bold: true }),
      ],
      alignment: AlignmentType.LEFT,
    }),

    new Paragraph({ text: '' }),
    new Paragraph({ text: 'شرایط مالی و ضوابط عمومی تحویل:', heading: HeadingLevel.HEADING_3, alignment: AlignmentType.RIGHT }),

    new Paragraph({
      children: [
        new TextRun({ text: '۱. زمان تحویل و اجرای پروژه: ', bold: true }),
        new TextRun({ text: `${toPersianDigits(executionDays)} روز کاری پس از دریافت پیش‌پرداخت.` }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '۲. مدت اعتبار قیمت‌های اعلام شده: ', bold: true }),
        new TextRun({ text: `${toPersianDigits(priceValidity)} روز کاری از تاریخ صدور این پیش‌فاکتور.` }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '۳. شرایط گارانتی و ضمانت‌نامه: ', bold: true }),
        new TextRun({ text: warranty }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '۴. محل تحویل تجهیزات: ', bold: true }),
        new TextRun({ text: deliveryLoc }),
      ],
      alignment: AlignmentType.RIGHT,
    }),

    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'با احترام، واحد فروش و مهندسی شرکت واته',
      alignment: AlignmentType.LEFT,
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: childrenParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `PreInvoice_${opportunity.companyName.replace(/\s+/g, '_')}_${opportunity.id.slice(-4)}.docx`);
}

export async function generateTechnicalProposalWordDoc(
  opportunity: Opportunity,
  companySettings?: CompanySettings
) {
  const companyName = companySettings?.companyName || 'شرکت مهندسی و تجهیزات صنعتی واته';
  const warranty = opportunity.approvalData?.warrantyTerms || '۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب (هرکدام زودتر فرا برسد)';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: companyName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'پیشنهاد فنی و تکنولوژیک تجهیزات صنعتی',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: 'عنوان پروژه / استعلام: ', bold: true }),
              new TextRun({ text: opportunity.title }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'نام مشتری / کارفرما: ', bold: true }),
              new TextRun({ text: `${opportunity.companyName} (${opportunity.customerName})` }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '۱. مقدمه و دامنه کاری (Scope of Supply)',
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: 'این پیشنهاد فنی جهت تامین، ساخت و تحویل تجهیزات صنعتی درخواستی مطابق آخرین استانداردهای صنعتی و مهندسی طراحی گردیده است.',
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '۲. مشخصات فنی دستگاه‌ها و تجهیزات ارائه شده',
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.RIGHT,
          }),
          ...(opportunity.items || []).map(
            (item, idx) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${toPersianDigits(idx + 1)}. ${item.name}: `, bold: true }),
                  new TextRun({ text: `تعداد: ${toPersianDigits(item.quantity)} ${item.unit || 'دستگاه'} - ${item.specs || 'استاندارد صنعتی کارخانه'}` }),
                ],
                alignment: AlignmentType.RIGHT,
              })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '۳. شرایط گارانتی و خدمات پس از فروش',
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'مدت زمان گارانتی: ', bold: true }),
              new TextRun({ text: warranty }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: 'کلیه قطعات و تجهیزات تا ۱۰ سال شامل تامین قطعات یدکی و پشتیبانی فنی مستقیم شرکت واته می‌باشند.',
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'تاییدکننده فنی: مدیریت مهندسی و فنی شرکت واته',
            alignment: AlignmentType.LEFT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `TechProposal_${opportunity.companyName.replace(/\s+/g, '_')}_${opportunity.id.slice(-4)}.docx`);
}
