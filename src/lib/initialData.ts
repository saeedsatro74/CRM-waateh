import {
  User,
  Customer,
  Lead,
  Deal,
  Task,
  Communication,
  Product,
  CustomerFile,
  NotificationItem,
  CompanySettings,
  ServiceRequest,
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'user-0',
    name: 'مهندس سعید صمیمی پور',
    email: 'saeedsatro7@gmail.com',
    role: 'admin',
    avatar: '/profile.png',
    phone: '۰۹۱۲۰۰۰۰۰۰۰',
    department: 'مدیریت ارشد دپارتمان سیستم‌ها',
    position: 'مدیر ارشد فواندیشن و توسعه',
    isActive: true,
  },
  {
    id: 'user-1',
    name: 'مهندس علیرضا رضایی',
    email: 'admin@waateh.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    phone: '۰۹۱۲۱۱۱۱۱۱۱',
    department: 'مدیریت ارشد تهویه واته',
    isActive: true,
  },
  {
    id: 'user-2',
    name: 'مهندس مهدی حسینی',
    email: 'sales_manager@waateh.com',
    role: 'sales_manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    phone: '۰۹۱۲۲۲۲۲۲۲۲',
    department: 'مدیریت واحد فروش و بازاریابی',
    isActive: true,
  },
  {
    id: 'user-3',
    name: 'سارا محمدی',
    email: 'sales@waateh.com',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    phone: '۰۹۱۲۳۳۳۳۳۳۳',
    department: 'واحد فروش و مناقصات',
    isActive: true,
  },
  {
    id: 'user-4',
    name: 'مهندس کامران حسینی',
    email: 'service@waateh.com',
    role: 'service',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    phone: '۰۹۱۲۴۴۴۴۴۴۴',
    department: 'دپارتمان خدمات فنی و نصب',
    isActive: true,
  },
];

// Clean Production Initial State (No Demo/Mock Data)
export const initialCustomers: Customer[] = [];
export const initialLeads: Lead[] = [];
export const initialDeals: Deal[] = [];
export const initialTasks: Task[] = [];
export const initialCommunications: Communication[] = [];
export const initialProducts: Product[] = [];
export const initialCustomerFiles: CustomerFile[] = [];
export const initialServiceRequests: ServiceRequest[] = [];
export const initialNotifications: NotificationItem[] = [];

export const initialCompanySettings: CompanySettings = {
  companyName: 'شرکت تهویه واته (WAATEH)',
  tagline: 'طراحی، تولید و خدمات مهندسی سیستم‌های تهویه مطبوع صنعتی',
  logoColor: '#0f766e',
  currencySymbol: 'تومان',
  taxRate: 10,
  phone: '۰۲۱۶۶۵۵۴۴۳۳',
  address: 'تهران، خیابان آزادی، پلاک ۱۲۴، ساختمان مهندسی واته',
  email: 'info@waateh.com',
  website: 'www.waateh.com',
};
