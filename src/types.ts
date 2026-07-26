export type UserRole = 'admin' | 'sales' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  department: string;
  isActive: boolean;
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

export type DealStage = 'initial_contact' | 'negotiation' | 'proposal' | 'contract' | 'won' | 'lost';

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

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskType = 'call' | 'meeting' | 'email' | 'followup' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  customerId?: string;
  customerName?: string;
  assignedToUserId: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  reminderMinutesBefore?: number;
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

