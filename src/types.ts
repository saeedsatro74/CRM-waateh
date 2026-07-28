export type UserRole = 'admin' | 'sales_manager' | 'sales' | 'service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  department: string;
  isActive: boolean;
  position?: string;
}

export type CustomerType = 'company' | 'person';

export type CustomerStatus = 'lead' | 'potential' | 'negotiating' | 'active' | 'inactive' | 'vip' | 'lost';

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  customerType: CustomerType;
  status: CustomerStatus;
  tags: string[];
  assignedToUserId: string;
  lastContactDate: string;
  createdAt: string;
  notes: string;
  budget: number; // in Tomans
  source: string;
  fileCount: number;
  awaitingResponse?: boolean;
}

export type OpportunityStage =
  | 'registration' // ۱. ثبت فرصت
  | 'pricing' // ۲. قیمت گذاری
  | 'ceo_review' // ۳. بررسی مدیرعامل
  | 'internal_marketing' // ۴. بازارگردانی داخلی
  | 'proforma' // ۵. پیش فاکتور
  | 'technical_proposal' // ۶. پیشنهاد فنی
  | 'final_approval' // ۷. تایید نهایی
  | 'sent'; // ۸. ارسال شد

export type DealStage = 'initial_contact' | 'negotiation' | 'proposal' | 'contract' | 'won' | 'lost';

export interface OpportunityFile {
  id: string;
  opportunityId: string;
  fileName: string;
  fileSize: string;
  fileType: string; // image, video, pdf, docx, xlsx, pptx, etc.
  dataUrl?: string; // base64 or blob URL
  uploadedAt: string;
  uploadedByUserId: string;
  uploadedByName: string;
  uploadedByRole?: UserRole;
}

export interface OpportunityApprovalData {
  discountPercent?: number; // درصد تخفیف
  executionTimeDays?: number; // زمان اجرا (روز کاری)
  priceValidityDays?: number; // اعتبار قیمت (روز)
  warrantyTerms?: string; // e.g. "۱۸ ماه پس از تحویل / ۱۲ ماه پس از نصب - هرکدام زودتر فرا برسد"
  deliveryLocationType?: 'factory' | 'custom';
  deliveryLocationCustom?: string;
  adminNotes?: string;
  approvedByAdminUserId?: string;
  approvedByAdminName?: string;
  approvedAt?: string;
  isStamped?: boolean;
}

export interface OpportunityWorkflowLog {
  id: string;
  opportunityId: string;
  fromStage: OpportunityStage | string;
  toStage: OpportunityStage | string;
  action: 'advance' | 'reject' | 'edit' | 'file_added' | 'approval_saved' | 'created' | 'pricing_updated';
  performedByUserId: string;
  performedByName: string;
  performedByRole: UserRole;
  timestamp: string;
  notes?: string;
}

export interface OpportunityItem {
  id: string;
  productId?: string;
  name: string;
  code?: string;
  quantity: number;
  unit: string;
  unitPrice: number; // تومان
  totalPrice: number; // تومان
  specs?: string; // مشخصات فنی دستگاه
}

export interface Opportunity {
  id: string;
  number?: string;
  title: string;
  customerId: string;
  customerName: string;
  companyName: string;
  phone: string;
  value: number; // تومان
  stage: OpportunityStage;
  assignedToUserId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  items: OpportunityItem[];
  files: OpportunityFile[];
  approvalData?: OpportunityApprovalData;
  history: OpportunityWorkflowLog[];
  hasPreInvoice?: boolean;
  hasTechnicalProposal?: boolean;
  finalPdfGenerated?: boolean;
  finalPdfUrl?: string;
}

export interface Lead {
  id: string;
  title: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  dealValue: number;
  stage: DealStage;
  priority: 'low' | 'medium' | 'high';
  assignedToUserId: string;
  createdAt: string;
  notes: string;
  source: string;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  companyName: string;
  value: number; // in Tomans
  stage: DealStage;
  probability: number; // percentage 0-100
  expectedCloseDate: string;
  assignedToUserId: string;
  createdAt: string;
  products?: string[];
  notes?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskType = 'call' | 'meeting' | 'email' | 'quote' | 'followup' | 'financial' | 'service' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  customerId?: string;
  customerName?: string;
  companyName?: string;
  phone?: string;
  assignedToUserId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  reminderMinutesBefore?: number;
  outcome?: string; // نتیجه پیگیری
  dealId?: string;
  createdAt: string;
}

export type CommunicationType = 'call' | 'meeting' | 'email' | 'whatsapp' | 'note';

export interface Communication {
  id: string;
  customerId: string;
  customerName: string;
  type: CommunicationType;
  summary: string;
  details?: string;
  date: string; // ISO or YYYY-MM-DD HH:mm
  recordedByUserId: string;
  durationMinutes?: number;
  outcome?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number; // in Tomans
  unit: 'عدد' | 'سرویس' | 'پروژه' | 'سالانه' | 'ماهانه' | 'ساعت';
  description: string;
  stockStatus: 'available' | 'custom' | 'discontinued';
}

export interface CustomerFile {
  id: string;
  customerId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'deal' | 'lead' | 'system' | 'customer';
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
  opportunityId?: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  logoColor: string;
  currencySymbol: string;
  taxRate: number;
  phone: string;
  address: string;
  email: string;
  website: string;
}

export type ServicePriority = 'low' | 'medium' | 'high' | 'urgent';
export type ServiceStatus = 'registered' | 'diagnosing' | 'in_repair' | 'waiting_parts' | 'completed' | 'delivered';
export type ServiceType = 'breakdown' | 'periodic_maintenance' | 'installation' | 'calibration' | 'warranty';

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  companyName: string;
  deviceModel: string;
  serialNumber?: string;
  serviceType: ServiceType;
  issueDescription: string;
  priority: ServicePriority;
  status: ServiceStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  estimatedCost?: number;
  createdAt: string;
  updatedAt: string;
  completionDate?: string;
  notes?: string;
}

export type ProformaStatus = 'draft' | 'pending' | 'sent' | 'approved' | 'converted' | 'rejected';

export interface ProformaItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number; // تومان
  discountPercent?: number;
  totalPrice: number; // تومان
}

export type ProformaType = 'sale' | 'purchase';

export interface ProformaInvoice {
  id: string;
  invoiceType?: ProformaType; // 'sale' = پیش‌فاکتور فروش, 'purchase' = پیش‌فاکتور خرید
  number: string; // e.g. WQ-1403-1001 or PQ-1403-2001
  customerId: string;
  customerName: string;
  companyName: string;
  phone: string;
  address: string;
  issueDate: string; // YYYY/MM/DD or Shamsi
  validUntil: string; // YYYY/MM/DD or Shamsi
  items: ProformaItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number; // 10%
  taxAmount: number;
  grandTotal: number;
  status: ProformaStatus;
  termsAndConditions: string;
  assignedToUserId: string;
  createdAt: string;
  dealId?: string;
}


