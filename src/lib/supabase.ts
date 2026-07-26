import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Complete 1-Click SQL Schema Script for CRM WAATEH (سیستم مدیریت مشتریان و خدمات تهویه واته)
export const SUPABASE_SQL_SCHEMA = `-- ================================================================
-- اسکریپت کامل ساخت دیتابیس CRM WAATEH (شرکت تهویه واته)
-- این کد را کپی کرده و در قسمت SQL Editor در پنل Supabase اجرا کنید.
-- ================================================================

-- 1. فعال‌سازی افزونه UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ساخت جداول (Tables)
-- ================================================================

-- 1- جدول کاربران (users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'sales', 'service')) DEFAULT 'sales',
  department TEXT DEFAULT 'واحد فروش تهویه واته',
  phone TEXT,
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2- جدول مشتریان (customers)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  customer_type TEXT CHECK (customer_type IN ('company', 'person')) DEFAULT 'company',
  status TEXT DEFAULT 'lead',
  description TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3- جدول تاریخچه ارتباطات مشتری (customer_contacts)
CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('call', 'meeting', 'message', 'email')) DEFAULT 'call',
  description TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4- جدول سرنخ‌های فروش (leads)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5- جدول فرصت‌های فروش (deals)
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'negotiation',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6- جدول خدمات و تعمیرات تهویه واته (services)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  service_status TEXT CHECK (service_status IN ('new', 'checking', 'repairing', 'completed')) DEFAULT 'new',
  technician TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7- جدول محصولات و تجهیزات تهویه (products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT,
  description TEXT,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8- جدول وظایف و پیگیری‌ها (tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9- جدول فایل‌های مشتریان (files)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- تنظیم باکت ذخیره‌سازی فایل (Supabase Storage Bucket)
-- ================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-files', 'customer-files', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- تنظیمات امنیت و دسترسی‌ها (Row Level Security - RLS)
-- ================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- سیاست‌های دسترسی (RLS Policies)
DROP POLICY IF EXISTS "Full access users" ON public.users;
CREATE POLICY "Full access users" ON public.users FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access customers" ON public.customers;
CREATE POLICY "Full access customers" ON public.customers FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access customer_contacts" ON public.customer_contacts;
CREATE POLICY "Full access customer_contacts" ON public.customer_contacts FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access leads" ON public.leads;
CREATE POLICY "Full access leads" ON public.leads FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access deals" ON public.deals;
CREATE POLICY "Full access deals" ON public.deals FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access services" ON public.services;
CREATE POLICY "Full access services" ON public.services FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access tasks" ON public.tasks;
CREATE POLICY "Full access tasks" ON public.tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access files" ON public.files;
CREATE POLICY "Full access files" ON public.files FOR ALL USING (true);

-- ================================================================
-- درج اطلاعات اولیه پایه‌ای شرکت تهویه واته (Seed Data)
-- ================================================================

-- ۱. ثبت پرسنل و کاربران پیش‌فرض
INSERT INTO public.users (id, name, email, role, department, phone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'مهندس علیرضا رضایی', 'admin@waateh.com', 'admin', 'مدیریت ارشد تهویه واته', '۰۹۱۲۱۱۱۱۱۱۱'),
  ('00000000-0000-0000-0000-000000000002', 'سارا محمدی', 'sales@waateh.com', 'sales', 'واحد فروش و مناقصات', '۰۹۱۲۲۲۲۲۲۲۲'),
  ('00000000-0000-0000-0000-000000000003', 'مهندس کامران حسینی', 'service@waateh.com', 'service', 'دپارتمان خدمات فنی و نصب', '۰۹۱۲۳۳۳۳۳۳۳')
ON CONFLICT (email) DO NOTHING;

-- ۲. ثبت محصولات پیش‌فرض تهویه واته
INSERT INTO public.products (name, model, description, price)
VALUES 
  ('چیلر تراکمی هوا خنک واته', 'Waateh-AC-Chiller-250', 'چیلر تراکمی با کمپرسور اسکرو مجهز به سیستم هوشمند PLC', 1850000000),
  ('هواساژ صنعتی هایژنیک', 'Waateh-AHU-H12', 'هواخساز بیمارستانی و کلین‌روم با فیلتراسیون ۳ مرحله‌ای HEPA', 680000000),
  ('فن کویل سقفی توکار', 'Waateh-FCU-800', 'فن کویل داکتی با صداگیری فوق‌العاده و راندمان سرمایش بالا', 28000000)
ON CONFLICT DO NOTHING;

-- ۳. ثبت یک مشتری نمونه اولیه
INSERT INTO public.customers (id, company_name, contact_name, phone, email, address, customer_type, status, description, assigned_to)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'مجتمع صنعتی فولاد کاوه',
  'مهندس کامران امینی',
  '۰۲۱۶۶۵۵۴۴۳۳',
  'info@kaveh-steel.com',
  'تهران، شهرک صنعتی شمس‌آباد، بلوار بوستان',
  'company',
  'active',
  'مشتری قدیمی تهویه واته - خریدار ۲ دستگاه چیلر تراکمی',
  '00000000-0000-0000-0000-000000000002'
) ON CONFLICT DO NOTHING;

-- ۴. ثبت یک درخواست خدمات نمونه اولیه
INSERT INTO public.services (customer_id, device_name, problem_description, service_status, technician)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'چیلر تراکمی شماره ۱ - سالن تولید',
  'کاهش فشار گاز مبرد و ارور Low Pressure روی پنل هوشمند',
  'checking',
  'مهندس کامران حسینی'
) ON CONFLICT DO NOTHING;
`;
