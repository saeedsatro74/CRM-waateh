import { useState, useEffect } from 'react';
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
  DealStage,
  ServiceRequest,
  ServiceStatus,
} from '../types';
import {
  initialUsers,
  initialCustomers,
  initialLeads,
  initialDeals,
  initialTasks,
  initialCommunications,
  initialProducts,
  initialCustomerFiles,
  initialNotifications,
  initialCompanySettings,
  initialServiceRequests,
} from './initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'waateh_crm_app_data_v3';

interface CRMDataState {
  currentUser: User | null;
  users: User[];
  customers: Customer[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  communications: Communication[];
  products: Product[];
  customerFiles: CustomerFile[];
  serviceRequests: ServiceRequest[];
  notifications: NotificationItem[];
  settings: CompanySettings;
  isSupabaseConnected: boolean;
  supabaseError: string | null;
}

function loadInitialState(): CRMDataState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        currentUser: parsed.currentUser || initialUsers[0],
        users: parsed.users?.length ? parsed.users : initialUsers,
        customers: parsed.customers?.length ? parsed.customers : initialCustomers,
        leads: parsed.leads?.length ? parsed.leads : initialLeads,
        deals: parsed.deals?.length ? parsed.deals : initialDeals,
        tasks: parsed.tasks?.length ? parsed.tasks : initialTasks,
        communications: parsed.communications?.length ? parsed.communications : initialCommunications,
        products: parsed.products?.length ? parsed.products : initialProducts,
        customerFiles: parsed.customerFiles?.length ? parsed.customerFiles : initialCustomerFiles,
        serviceRequests: parsed.serviceRequests?.length ? parsed.serviceRequests : initialServiceRequests,
        notifications: parsed.notifications?.length ? parsed.notifications : initialNotifications,
        settings: parsed.settings || initialCompanySettings,
        isSupabaseConnected: false,
        supabaseError: null,
      };
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }

  return {
    currentUser: initialUsers[0],
    users: initialUsers,
    customers: initialCustomers,
    leads: initialLeads,
    deals: initialDeals,
    tasks: initialTasks,
    communications: initialCommunications,
    products: initialProducts,
    customerFiles: initialCustomerFiles,
    serviceRequests: initialServiceRequests,
    notifications: initialNotifications,
    settings: initialCompanySettings,
    isSupabaseConnected: false,
    supabaseError: null,
  };
}

let globalState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  listeners.forEach((listener) => listener());
}

let hasFetchedSupabase = false;

async function syncWithSupabase() {
  if (!supabase || !isSupabaseConfigured || hasFetchedSupabase) return;
  hasFetchedSupabase = true;

  try {
    // 1. Fetch Customers
    const { data: custData, error: custErr } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (custErr) {
      console.warn('Supabase Customers fetch error:', custErr.message);
      globalState.supabaseError = `خطا در دریافت جدول مشتریان: ${custErr.message}. لطفاً اسکریپت SQL را در Supabase اجرا کنید.`;
      notify();
    } else if (custData && custData.length > 0) {
      globalState.customers = custData.map((c: any) => ({
        id: c.id,
        companyName: c.company_name || 'بدون نام شرکت',
        name: c.contact_name || 'بدون نام رابط',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || '',
        customerType: c.customer_type || 'company',
        status: c.status || 'lead',
        tags: ['Supabase DB'],
        assignedToUserId: c.assigned_to || '',
        lastContactDate: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: c.description || '',
        budget: 0,
        source: 'Supabase',
        fileCount: 0,
      }));
      globalState.isSupabaseConnected = true;
      globalState.supabaseError = null;
      notify();
    } else {
      globalState.isSupabaseConnected = true;
      globalState.supabaseError = null;
      notify();
    }

    // 2. Fetch Services
    const { data: srvData } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (srvData && srvData.length > 0) {
      globalState.serviceRequests = srvData.map((s: any) => {
        let statusValue: ServiceStatus = 'registered';
        if (s.service_status === 'checking') statusValue = 'diagnosing';
        else if (s.service_status === 'repairing') statusValue = 'in_repair';
        else if (s.service_status === 'completed') statusValue = 'completed';
        else if (['registered', 'diagnosing', 'in_repair', 'waiting_parts', 'completed', 'delivered'].includes(s.service_status)) {
          statusValue = s.service_status as ServiceStatus;
        }

        return {
          id: s.id,
          requestNumber: `W-SRV-${s.id.slice(0, 5)}`,
          customerId: s.customer_id || '',
          customerName: 'مشتری تهویه واته',
          companyName: 'شرکت ثبت شده در دیتابیس',
          deviceModel: s.device_name || 'تجهیزات تهویه',
          serialNumber: 'SN-SUPABASE',
          serviceType: 'breakdown',
          issueDescription: s.problem_description || 'نیاز به بررسی تکنسین',
          priority: 'medium',
          status: statusValue,
          assignedTechnicianName: s.technician || 'کارشناس فنی واته',
          createdAt: s.created_at ? s.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          updatedAt: s.created_at ? s.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        };
      });
      notify();
    }

    // 3. Fetch Deals
    const { data: dealsData } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (dealsData && dealsData.length > 0) {
      globalState.deals = dealsData.map((d: any) => ({
        id: d.id,
        title: d.title || 'فرصت فروش واته',
        customerId: d.customer_id || '',
        customerName: 'مشتری فروش',
        companyName: 'شرکت خریدار',
        value: Number(d.value) || 0,
        stage: d.stage || 'negotiation',
        probability: 70,
        expectedCloseDate: new Date().toISOString().split('T')[0],
        assignedToUserId: d.assigned_to || '',
        createdAt: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      notify();
    }

    // 4. Fetch Leads
    const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (leadsData && leadsData.length > 0) {
      globalState.leads = leadsData.map((l: any) => ({
        id: l.id,
        title: l.customer_name || 'سرنخ جدید',
        customerName: l.customer_name || '',
        companyName: l.customer_name || '',
        phone: l.phone || '',
        email: '',
        source: l.source || 'دیجیتال مارکتینگ',
        stage: l.status === 'converted' ? 'won' : 'initial_contact',
        priority: 'medium',
        dealValue: 0,
        assignedToUserId: '',
        createdAt: l.created_at ? l.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: l.notes || '',
      }));
      notify();
    }

    // 5. Fetch Products
    const { data: prodsData } = await supabase.from('products').select('*');
    if (prodsData && prodsData.length > 0) {
      globalState.products = prodsData.map((p: any) => ({
        id: p.id,
        name: p.name || 'محصول واته',
        category: 'تجهیزات تهویه مطبوع',
        code: p.model || 'W-PROD',
        price: Number(p.price) || 0,
        unit: 'عدد',
        description: p.description || '',
        stockStatus: 'available',
      }));
      notify();
    }

    // 6. Fetch Users
    const { data: usersData } = await supabase.from('users').select('*');
    if (usersData && usersData.length > 0) {
      globalState.users = usersData.map((u: any) => ({
        id: u.id,
        name: u.name || 'کاربر واته',
        email: u.email || 'user@waateh.com',
        role: u.role || 'sales',
        department: u.department || 'واحد فروش',
        phone: u.phone || '',
        avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        isActive: u.is_active ?? true,
      }));
      notify();
    }

  } catch (err: any) {
    console.error('Error syncing Supabase:', err);
  }
}

export function useCRMStore() {
  const [state, setState] = useState<CRMDataState>(globalState);

  useEffect(() => {
    const handleChange = () => setState({ ...globalState });
    listeners.add(handleChange);

    if (isSupabaseConfigured && !hasFetchedSupabase) {
      syncWithSupabase();
    }

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  // Auth & User Actions
  const setCurrentUser = (user: User | null) => {
    globalState.currentUser = user;
    notify();
  };

  const switchUserRole = (role: User['role']) => {
    const targetUser = globalState.users.find((u) => u.role === role) || globalState.users[0];
    globalState.currentUser = targetUser;
    notify();
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    const tempId = `user-${Date.now()}`;
    const created: User = {
      ...newUser,
      id: tempId,
    };
    globalState.users.push(created);
    notify();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').insert([
          {
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department || 'واحد فروش',
            phone: newUser.phone || null,
            is_active: newUser.isActive ?? true,
          }
        ]).select();

        if (error) {
          addNotification({
            title: 'خطا در افزودن کاربر در Supabase',
            message: `پیام خطا: ${error.message}`,
            type: 'task',
          });
        } else if (data && data[0]) {
          globalState.users = globalState.users.map((u) =>
            u.id === tempId ? { ...u, id: data[0].id } : u
          );
          notify();
        }
      } catch (e: any) {
        console.error('Supabase addUser error:', e);
      }
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    globalState.users = globalState.users.map((u) => (u.id === userId ? { ...u, role } : u));
    if (globalState.currentUser?.id === userId) {
      globalState.currentUser = { ...globalState.currentUser, role };
    }
    notify();

    if (supabase && isSupabaseConfigured && !userId.startsWith('user-')) {
      await supabase.from('users').update({ role }).eq('id', userId);
    }
  };

  const deleteUser = async (userId: string) => {
    if (globalState.users.length <= 1) return;
    globalState.users = globalState.users.filter((u) => u.id !== userId);
    if (globalState.currentUser?.id === userId) {
      globalState.currentUser = globalState.users[0];
    }
    notify();

    if (supabase && isSupabaseConfigured && !userId.startsWith('user-')) {
      await supabase.from('users').delete().eq('id', userId);
    }
  };

  // Customers (مشتریان)
  const addCustomer = async (custData: Omit<Customer, 'id' | 'createdAt' | 'fileCount'>) => {
    const tempId = `cust-${Date.now()}`;
    const created: Customer = {
      ...custData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
      fileCount: 0,
    };
    globalState.customers.unshift(created);

    addNotification({
      title: 'مشتری جدید ثبت شد',
      message: `${created.name} (${created.companyName}) به لیست مشتریان اضافه گردید.`,
      type: 'customer',
      linkTab: 'customers',
    });

    notify();

    // Direct insertion into Supabase table `customers`
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('customers').insert([
          {
            company_name: custData.companyName,
            contact_name: custData.name,
            phone: custData.phone,
            email: custData.email || null,
            address: custData.address || null,
            customer_type: custData.customerType || 'company',
            status: custData.status || 'lead',
            description: custData.notes || null,
          }
        ]).select();

        if (error) {
          console.error('Supabase Customers Insert Error:', error);
          addNotification({
            title: 'خطا در ثبت جدول customers دیتابیس Supabase',
            message: `خطای دیتابیس: ${error.message}. لطفاً مطمئن شوید کد SQL در SQL Editor پورتال Supabase اجرا شده است.`,
            type: 'task',
          });
        } else if (data && data[0]) {
          const supabaseCustomer = data[0];
          globalState.customers = globalState.customers.map((c) =>
            c.id === tempId ? { ...c, id: supabaseCustomer.id } : c
          );
          addNotification({
            title: 'ذخیره‌سازی در Supabase',
            message: `مشتری «${created.companyName}» با موفقیت در جدول customers دیتابیس Supabase ثبت شد.`,
            type: 'customer',
            linkTab: 'customers',
          });
          notify();
        }
      } catch (err: any) {
        console.error('Exception adding customer to Supabase:', err);
      }
    } else {
      addNotification({
        title: 'تنظیمات Supabase ناقص است',
        message: 'کلیدهای اتصال Supabase ست نشده‌اند. مشتری فعلاً در حافظه محلی ذخیره شد.',
        type: 'task',
      });
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    globalState.customers = globalState.customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    notify();

    if (supabase && isSupabaseConfigured && !id.startsWith('cust-')) {
      const dbUpdates: any = {};
      if (updates.companyName) dbUpdates.company_name = updates.companyName;
      if (updates.name) dbUpdates.contact_name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.customerType) dbUpdates.customer_type = updates.customerType;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes) dbUpdates.description = updates.notes;

      await supabase.from('customers').update(dbUpdates).eq('id', id);
    }
  };

  const deleteCustomer = async (id: string) => {
    globalState.customers = globalState.customers.filter((c) => c.id !== id);
    globalState.deals = globalState.deals.filter((d) => d.customerId !== id);
    globalState.tasks = globalState.tasks.filter((t) => t.customerId !== id);
    globalState.serviceRequests = globalState.serviceRequests.filter((s) => s.customerId !== id);
    notify();

    if (supabase && isSupabaseConfigured && !id.startsWith('cust-')) {
      await supabase.from('customers').delete().eq('id', id);
    }
  };

  // Service Requests (خدمات)
  const addServiceRequest = async (srvData: Omit<ServiceRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'>) => {
    const reqNum = `W-SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempId = `srv-${Date.now()}`;
    const created: ServiceRequest = {
      ...srvData,
      id: tempId,
      requestNumber: reqNum,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    globalState.serviceRequests.unshift(created);

    addNotification({
      title: 'درخواست خدمات جدید ثبت شد',
      message: `درخواست ${reqNum} برای دستگاه ${srvData.deviceModel} ثبت گردید.`,
      type: 'task',
      linkTab: 'services',
    });

    notify();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('services').insert([
          {
            customer_id: srvData.customerId && !srvData.customerId.startsWith('cust-') ? srvData.customerId : null,
            device_name: srvData.deviceModel,
            problem_description: srvData.issueDescription,
            service_status: srvData.status || 'new',
            technician: srvData.assignedTechnicianName || 'کارشناس فنی واته',
          }
        ]).select();

        if (error) {
          console.error('Supabase Services Insert Error:', error);
        } else if (data && data[0]) {
          globalState.serviceRequests = globalState.serviceRequests.map((s) =>
            s.id === tempId ? { ...s, id: data[0].id } : s
          );
          notify();
        }
      } catch (e: any) {
        console.error('Supabase service insert error:', e);
      }
    }
  };

  const updateServiceRequestStatus = async (id: string, status: ServiceStatus, notes?: string) => {
    globalState.serviceRequests = globalState.serviceRequests.map((s) =>
      s.id === id
        ? {
            ...s,
            status,
            notes: notes !== undefined ? notes : s.notes,
            updatedAt: new Date().toISOString().split('T')[0],
            completionDate: status === 'completed' || status === 'delivered' ? new Date().toISOString().split('T')[0] : s.completionDate,
          }
        : s
    );
    notify();

    if (supabase && isSupabaseConfigured && !id.startsWith('srv-')) {
      await supabase.from('services').update({ service_status: status }).eq('id', id);
    }
  };

  const deleteServiceRequest = async (id: string) => {
    globalState.serviceRequests = globalState.serviceRequests.filter((s) => s.id !== id);
    notify();

    if (supabase && isSupabaseConfigured && !id.startsWith('srv-')) {
      await supabase.from('services').delete().eq('id', id);
    }
  };

  // Leads (سرنخ‌ها)
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const tempId = `lead-${Date.now()}`;
    const created: Lead = {
      ...leadData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    globalState.leads.unshift(created);
    notify();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('leads').insert([
          {
            customer_name: leadData.customerName || leadData.companyName,
            phone: leadData.phone || null,
            source: leadData.source || 'استعلام مستقیم',
            status: leadData.stage || 'new',
            notes: leadData.notes || null,
          }
        ]).select();

        if (error) {
          console.error('Supabase Leads Insert Error:', error);
        } else if (data && data[0]) {
          globalState.leads = globalState.leads.map((l) =>
            l.id === tempId ? { ...l, id: data[0].id } : l
          );
          notify();
        }
      } catch (e: any) {
        console.error('Supabase lead insert error:', e);
      }
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    globalState.leads = globalState.leads.map((l) => (l.id === id ? { ...l, ...updates } : l));
    notify();

    if (supabase && isSupabaseConfigured && !id.startsWith('lead-')) {
      await supabase.from('leads').update({
        customer_name: updates.customerName || updates.companyName,
        phone: updates.phone,
        status: updates.stage,
        notes: updates.notes,
      }).eq('id', id);
    }
  };

  const convertLeadToDeal = async (lead: Lead) => {
    let customer = globalState.customers.find(
      (c) => c.companyName.toLowerCase() === lead.companyName.toLowerCase()
    );

    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        name: lead.customerName,
        companyName: lead.companyName,
        phone: lead.phone || '۰۲۱۶۶۵۵۴۴۳۳',
        email: lead.email || '',
        address: 'ثبت شده از طریق سرنخ فروش واته',
        customerType: 'company',
        status: 'potential',
        tags: ['سرنخ فروش'],
        assignedToUserId: lead.assignedToUserId,
        lastContactDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        notes: lead.notes,
        budget: lead.dealValue,
        source: lead.source,
        fileCount: 0,
      };
      globalState.customers.unshift(customer);
    }

    const createdDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: lead.title,
      customerId: customer.id,
      customerName: lead.customerName,
      companyName: lead.companyName,
      value: lead.dealValue,
      stage: lead.stage === 'won' ? 'won' : 'negotiation',
      probability: lead.stage === 'won' ? 100 : 60,
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedToUserId: lead.assignedToUserId,
      createdAt: new Date().toISOString().split('T')[0],
      notes: lead.notes,
    };
    globalState.deals.unshift(createdDeal);

    globalState.leads = globalState.leads.filter((l) => l.id !== lead.id);

    addNotification({
      title: 'تبدیل سرنخ به فرصت فروش',
      message: `سرنخ «${lead.title}» با موفقیت به فرصت فروش تبدیل شد.`,
      type: 'deal',
      linkTab: 'sales',
    });

    notify();

    if (supabase && isSupabaseConfigured) {
      await supabase.from('deals').insert([
        {
          customer_id: customer.id.startsWith('cust-') ? null : customer.id,
          title: lead.title,
          value: lead.dealValue,
          stage: lead.stage === 'won' ? 'won' : 'negotiation',
          status: 'open',
        }
      ]);
      if (!lead.id.startsWith('lead-')) {
        await supabase.from('leads').delete().eq('id', lead.id);
      }
    }
  };

  // Deals (فرصت‌های فروش)
  const addDeal = async (dealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const tempId = `deal-${Date.now()}`;
    const created: Deal = {
      ...dealData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    globalState.deals.unshift(created);
    notify();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('deals').insert([
          {
            customer_id: dealData.customerId && !dealData.customerId.startsWith('cust-') ? dealData.customerId : null,
            title: dealData.title,
            value: dealData.value,
            stage: dealData.stage || 'negotiation',
            status: 'open',
          }
        ]).select();

        if (error) {
          console.error('Supabase Deals Insert Error:', error);
        } else if (data && data[0]) {
          globalState.deals = globalState.deals.map((d) =>
            d.id === tempId ? { ...d, id: data[0].id } : d
          );
          notify();
        }
      } catch (e: any) {
        console.error('Supabase deal insert error:', e);
      }
    }
  };

  const updateDealStage = async (dealId: string, newStage: DealStage) => {
    const probabilities: Record<DealStage, number> = {
      initial_contact: 20,
      negotiation: 50,
      proposal: 70,
      contract: 90,
      won: 100,
      lost: 0,
    };

    globalState.deals = globalState.deals.map((d) =>
      d.id === dealId ? { ...d, stage: newStage, probability: probabilities[newStage] } : d
    );
    notify();

    if (supabase && isSupabaseConfigured && !dealId.startsWith('deal-')) {
      await supabase.from('deals').update({ stage: newStage }).eq('id', dealId);
    }
  };

  const deleteDeal = async (dealId: string) => {
    globalState.deals = globalState.deals.filter((d) => d.id !== dealId);
    notify();

    if (supabase && isSupabaseConfigured && !dealId.startsWith('deal-')) {
      await supabase.from('deals').delete().eq('id', dealId);
    }
  };

  // Tasks (وظایف)
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const tempId = `task-${Date.now()}`;
    const created: Task = {
      ...taskData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    globalState.tasks.unshift(created);

    addNotification({
      title: 'وظیفه جدید ثبت شد',
      message: `وظیفه «${created.title}» ثبت گردید.`,
      type: 'task',
      linkTab: 'tasks',
    });

    notify();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('tasks').insert([
          {
            title: taskData.title,
            due_date: taskData.dueDate,
            status: taskData.status || 'pending',
            customer_id: taskData.customerId && !taskData.customerId.startsWith('cust-') ? taskData.customerId : null,
          }
        ]).select();

        if (error) {
          console.error('Supabase Tasks Insert Error:', error);
        } else if (data && data[0]) {
          globalState.tasks = globalState.tasks.map((t) =>
            t.id === tempId ? { ...t, id: data[0].id } : t
          );
          notify();
        }
      } catch (e: any) {
        console.error('Supabase task insert error:', e);
      }
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    let nextStatus: Task['status'] = 'pending';
    globalState.tasks = globalState.tasks.map((t) => {
      if (t.id === taskId) {
        nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    notify();

    if (supabase && isSupabaseConfigured && !taskId.startsWith('task-')) {
      await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId);
    }
  };

  const deleteTask = async (taskId: string) => {
    globalState.tasks = globalState.tasks.filter((t) => t.id !== taskId);
    notify();

    if (supabase && isSupabaseConfigured && !taskId.startsWith('task-')) {
      await supabase.from('tasks').delete().eq('id', taskId);
    }
  };

  // Communications
  const addCommunication = async (commData: Omit<Communication, 'id'>) => {
    const created: Communication = {
      ...commData,
      id: `comm-${Date.now()}`,
    };
    globalState.communications.unshift(created);

    if (commData.customerId) {
      globalState.customers = globalState.customers.map((c) =>
        c.id === commData.customerId
          ? { ...c, lastContactDate: new Date().toISOString().split('T')[0], awaitingResponse: false }
          : c
      );
    }

    notify();

    if (supabase && isSupabaseConfigured && commData.customerId && !commData.customerId.startsWith('cust-')) {
      await supabase.from('customer_contacts').insert([
        {
          customer_id: commData.customerId,
          type: commData.type,
          description: commData.summary,
        }
      ]);
    }
  };

  // Products
  const addProduct = async (prodData: Omit<Product, 'id'>) => {
    const tempId = `prod-${Date.now()}`;
    const created: Product = {
      ...prodData,
      id: tempId,
    };
    globalState.products.unshift(created);
    notify();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('products').insert([
          {
            name: prodData.name,
            model: prodData.code,
            description: prodData.description,
            price: prodData.price,
          }
        ]).select();

        if (error) {
          console.error('Supabase Products Insert Error:', error);
        } else if (data && data[0]) {
          globalState.products = globalState.products.map((p) =>
            p.id === tempId ? { ...p, id: data[0].id } : p
          );
          notify();
        }
      } catch (e: any) {
        console.error('Supabase product insert error:', e);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    globalState.products = globalState.products.filter((p) => p.id !== id);
    notify();

    if (supabase && isSupabaseConfigured && !id.startsWith('prod-')) {
      await supabase.from('products').delete().eq('id', id);
    }
  };

  // Files
  const addCustomerFile = async (fileData: Omit<CustomerFile, 'id' | 'uploadedAt'>) => {
    const tempId = `file-${Date.now()}`;
    const created: CustomerFile = {
      ...fileData,
      id: tempId,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    globalState.customerFiles.unshift(created);

    globalState.customers = globalState.customers.map((c) =>
      c.id === fileData.customerId ? { ...c, fileCount: (c.fileCount || 0) + 1 } : c
    );

    notify();

    if (supabase && isSupabaseConfigured && fileData.customerId && !fileData.customerId.startsWith('cust-')) {
      await supabase.from('files').insert([
        {
          customer_id: fileData.customerId,
          file_name: fileData.fileName,
          file_url: 'https://via.placeholder.com/150',
        }
      ]);
    }
  };

  const deleteCustomerFile = async (fileId: string, customerId: string) => {
    globalState.customerFiles = globalState.customerFiles.filter((f) => f.id !== fileId);
    globalState.customers = globalState.customers.map((c) =>
      c.id === customerId ? { ...c, fileCount: Math.max(0, (c.fileCount || 0) - 1) } : c
    );
    notify();

    if (supabase && isSupabaseConfigured && !fileId.startsWith('file-')) {
      await supabase.from('files').delete().eq('id', fileId);
    }
  };

  // Notifications
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const created: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'هم‌اکنون',
      isRead: false,
    };
    globalState.notifications.unshift(created);
    notify();
  };

  const markNotificationRead = (id: string) => {
    globalState.notifications = globalState.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    notify();
  };

  const clearAllNotifications = () => {
    globalState.notifications = [];
    notify();
  };

  // Settings
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    globalState.settings = { ...globalState.settings, ...newSettings };
    notify();
  };

  const resetDataToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    hasFetchedSupabase = false;
    globalState = {
      currentUser: initialUsers[0],
      users: initialUsers,
      customers: initialCustomers,
      leads: initialLeads,
      deals: initialDeals,
      tasks: initialTasks,
      communications: initialCommunications,
      products: initialProducts,
      customerFiles: initialCustomerFiles,
      serviceRequests: initialServiceRequests,
      notifications: initialNotifications,
      settings: initialCompanySettings,
      isSupabaseConnected: false,
      supabaseError: null,
    };
    notify();
  };

  // Role Based Filter Helper
  const isManager = state.currentUser?.role === 'admin';
  const currentUserId = state.currentUser?.id;

  const accessibleCustomers = isManager
    ? state.customers
    : state.customers.filter((c) => c.assignedToUserId === currentUserId || !c.assignedToUserId);

  const accessibleLeads = isManager
    ? state.leads
    : state.leads.filter((l) => l.assignedToUserId === currentUserId || !l.assignedToUserId);

  const accessibleDeals = isManager
    ? state.deals
    : state.deals.filter((d) => d.assignedToUserId === currentUserId || !d.assignedToUserId);

  const accessibleTasks = isManager
    ? state.tasks
    : state.tasks.filter((t) => t.assignedToUserId === currentUserId);

  return {
    state,
    currentUser: state.currentUser,
    users: state.users,
    isManager,
    isSupabaseConnected: state.isSupabaseConnected,
    supabaseError: state.supabaseError,
    setCurrentUser,
    switchUserRole,
    addUser,
    updateUserRole,
    deleteUser,
    // Customers
    accessibleCustomers,
    allCustomers: state.customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    // Service Requests
    serviceRequests: state.serviceRequests,
    addServiceRequest,
    updateServiceRequestStatus,
    deleteServiceRequest,
    // Leads
    accessibleLeads,
    allLeads: state.leads,
    addLead,
    updateLead,
    convertLeadToDeal,
    // Deals
    accessibleDeals,
    allDeals: state.deals,
    addDeal,
    updateDealStage,
    deleteDeal,
    // Tasks
    accessibleTasks,
    allTasks: state.tasks,
    addTask,
    toggleTaskStatus,
    deleteTask,
    // Communications
    communications: state.communications,
    addCommunication,
    // Products
    products: state.products,
    addProduct,
    deleteProduct,
    // Customer Files
    customerFiles: state.customerFiles,
    addCustomerFile,
    deleteCustomerFile,
    // Notifications
    notifications: state.notifications,
    unreadNotificationCount: state.notifications.filter((n) => !n.isRead).length,
    markNotificationRead,
    clearAllNotifications,
    // Settings & Control
    settings: state.settings,
    updateSettings,
    resetDataToDefault,
  };
}
