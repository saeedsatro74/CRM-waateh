import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Remove wrapping single or double quotes
  url = url.replace(/^['"]+|['"]+$/g, '');
  // Remove /rest/v1 or /rest or trailing slashes
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/rest\/?$/i, '');
  url = url.replace(/\/+$/, '');

  if (!url.startsWith('http://') && !url.startsWith('https://') && url.length > 0) {
    url = 'https://' + url;
  }
  return url;
}

export function getActiveSupabaseCredentials() {
  let url = env.VITE_SUPABASE_URL || '';
  let key = env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const custom = localStorage.getItem('waateh_supabase_custom_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.url) url = parsed.url;
      if (parsed.key) key = parsed.key;
    }
  } catch (e) {
    console.error('Error reading custom supabase config:', e);
  }

  url = sanitizeSupabaseUrl(url);
  key = (key || '').trim().replace(/^['"]+|['"]+$/g, '');

  return { url, key };
}

const activeCredentials = getActiveSupabaseCredentials();

export const isSupabaseConfigured = Boolean(
  activeCredentials.url &&
  activeCredentials.key &&
  activeCredentials.url.startsWith('http')
);

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(activeCredentials.url, activeCredentials.key)
  : null;

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getActiveSupabaseCredentials();
  if (creds.url && creds.key && creds.url.startsWith('http')) {
    if (!supabase) {
      supabase = createClient(creds.url, creds.key);
    }
    return supabase;
  }
  return null;
}

export function getSupabaseCredentials() {
  return getActiveSupabaseCredentials();
}

export function saveSupabaseCredentials(rawUrl: string, rawKey: string) {
  const url = sanitizeSupabaseUrl(rawUrl);
  const key = (rawKey || '').trim().replace(/^['"]+|['"]+$/g, '');

  localStorage.setItem('waateh_supabase_custom_config', JSON.stringify({ url, key }));

  if (url && key && url.startsWith('http')) {
    supabase = createClient(url, key);
  } else {
    supabase = null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const creds = getActiveSupabaseCredentials();
  if (!creds.url || !creds.key) {
    return {
      success: false,
      message: 'آدرس URL یا کلید ANON_KEY ثبت نشده است. لطفاً ابتدا مقادیر را در کادرهای بالا وارد کرده و دکمه ذخیره را بزنید.',
    };
  }

  if (!creds.url.startsWith('http')) {
    return {
      success: false,
      message: 'آدرس URL نامعتبر است. URL باید با https:// شروع شود (مانند https://xxxx.supabase.co).',
    };
  }

  try {
    const testClient = createClient(creds.url, creds.key);
    const { data, error } = await testClient.from('customers').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST125' || error.message?.includes('Invalid path')) {
        return {
          success: false,
          message: 'خطای آدرس دیتابیس (PGRST125): آدرس URL که وارد کرده‌اید اشتباه است! آدرس پروژه Supabase باید فقط به صورت https://xxxx.supabase.co باشد (بدون /rest/v1 یا اسلش اضافی در انتهای آن). سیستم آدرس را تصحیح کرد، لطفاً دکمه «ذخیره کلیدها» را مجدداً بزنید.',
        };
      }
      if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('apikey') || error.message?.includes('invalid API key')) {
        return {
          success: false,
          message: 'کلید ANON_KEY نامعتبر است! لطفاً به پنل Supabase > Project Settings > API رفته و کلید anon public را به طور کامل کپی کنید.',
        };
      }
      if (error.message?.includes('relation "public.customers" does not exist') || error.code === '42P01') {
        return {
          success: false,
          message: 'ارتباط با Supabase برقرار شد، اما جداول ساخته نشده‌اند! لطفاً کد اسکریپت SQL پایین همین صفحه را کپی کرده و در بخش SQL Editor در پنل Supabase اجرا کنید.',
        };
      }
      return {
        success: false,
        message: `خطای دیتابیس Supabase: ${error.message} (کد خطا: ${error.code || 'نامشخص'})`,
      };
    }

    return {
      success: true,
      message: `اتصال به دیتابیس Supabase کاملاً موفقیت‌آمیز است! جدول مشتریان شناسایی گردید و آماده ارسال و دریافت اطلاعات است (${data ? data.length : 0} رکورد دریافت شد).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `خطای غیرمنتظره شبکه: ${err?.message || 'امکان برقراری ارتباط با URL وارد شده وجود ندارد.'}`,
    };
  }
}

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
  role TEXT CHECK (role IN ('admin', 'sales_manager', 'sales', 'service')) DEFAULT 'sales',
  department TEXT DEFAULT 'واحد فروش تهویه واته',
  phone TEXT,
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- آپدیت و اصلاح محدودیت نقش‌های جدول کاربران (جهت پذیرش sales_manager در دیتابیس‌های موجود)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'sales_manager', 'sales', 'service'));

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
  service_status TEXT DEFAULT 'new',
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
-- تنظیم باکت‌های ذخیره‌سازی فایل و آواتار (Supabase Storage Buckets)
-- ================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('customer-files', 'customer-files', true),
  ('profile-images', 'profile-images', true)
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

-- سیاست‌های کامل دسترسی خواندن، نوشتن و ویرایش (RLS Policies)
DROP POLICY IF EXISTS "Full access users" ON public.users;
CREATE POLICY "Full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access customers" ON public.customers;
CREATE POLICY "Full access customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access customer_contacts" ON public.customer_contacts;
CREATE POLICY "Full access customer_contacts" ON public.customer_contacts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access leads" ON public.leads;
CREATE POLICY "Full access leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access deals" ON public.deals;
CREATE POLICY "Full access deals" ON public.deals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access services" ON public.services;
CREATE POLICY "Full access services" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access tasks" ON public.tasks;
CREATE POLICY "Full access tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access files" ON public.files;
CREATE POLICY "Full access files" ON public.files FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- درج اطلاعات اولیه پایه‌ای شرکت تهویه واته (Seed Data)
-- ================================================================

-- ۱. ثبت پرسنل و کاربران پیش‌فرض (admin, sales_manager, sales, service)
INSERT INTO public.users (id, name, email, role, department, phone, avatar)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'مهندس سعید صمیمی پور', 'saeedsatro7@gmail.com', 'admin', 'مدیریت ارشد دپارتمان سیستم‌ها', '۰۹۱۲۰۰۰۰۰۰۰', 'profile.png'),
  ('00000000-0000-0000-0000-000000000001', 'مهندس علیرضا رضایی', 'admin@waateh.com', 'admin', 'مدیریت ارشد تهویه واته', '۰۹۱۲۱۱۱۱۱۱۱', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'),
  ('00000000-0000-0000-0000-000000000002', 'مهندس مهدی حسینی', 'sales_manager@waateh.com', 'sales_manager', 'مدیریت واحد فروش و بازاریابی', '۰۹۱۲۲۲۲۲۲۲۲', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'),
  ('00000000-0000-0000-0000-000000000003', 'سارا محمدی', 'sales@waateh.com', 'sales', 'واحد فروش و مناقصات', '۰۹۱۲۳۳۳۳۳۳۳', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250'),
  ('00000000-0000-0000-0000-000000000004', 'مهندس کامران حسینی', 'service@waateh.com', 'service', 'دپارتمان خدمات فنی و نصب', '۰۹۱۲۴۴۴۴۴۴۴', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250')
ON CONFLICT (email) DO UPDATE SET avatar = EXCLUDED.avatar;

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

export async function uploadProfileAvatar(userId: string, file: File): Promise<string> {
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `profiles/${userId}/avatar_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await client.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = client.storage
          .from('profile-images')
          .getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (err) {
      console.warn('Storage upload exception:', err);
    }
  }

  // Fallback to FileReader DataURL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(typeof reader.result === 'string' ? reader.result : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250');
    };
    reader.readAsDataURL(file);
  });
}
