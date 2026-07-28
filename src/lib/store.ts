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
  ProformaInvoice,
  ProformaStatus,
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
  initialProformaInvoices,
} from './initialData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'waateh_crm_app_v4_prod';

interface CRMDataState {
  currentUser: User | null;
  primaryUser: User | null;
  isAuthChecked: boolean;
  users: User[];
  customers: Customer[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  communications: Communication[];
  products: Product[];
  customerFiles: CustomerFile[];
  serviceRequests: ServiceRequest[];
  proformaInvoices: ProformaInvoice[];
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
      const loadedUsers: User[] = parsed.users?.length ? parsed.users : initialUsers;

      // Always ensure Saeed Samimipour exists in users
      const saeedInInitial = initialUsers.find(u => u.email === 'saeedsatro7@gmail.com');
      if (saeedInInitial && !loadedUsers.some(u => u.email === saeedInInitial.email)) {
        loadedUsers.unshift(saeedInInitial);
      }

      return {
        currentUser: null,
        primaryUser: null,
        isAuthChecked: false,
        users: loadedUsers,
        customers: parsed.customers || [],
        leads: parsed.leads || [],
        deals: parsed.deals || [],
        tasks: parsed.tasks || [],
        communications: parsed.communications || [],
        products: parsed.products || [],
        customerFiles: parsed.customerFiles || [],
        serviceRequests: parsed.serviceRequests || [],
        proformaInvoices: parsed.proformaInvoices || initialProformaInvoices,
        notifications: parsed.notifications || [],
        settings: parsed.settings || initialCompanySettings,
        isSupabaseConnected: false,
        supabaseError: null,
      };
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }

  return {
    currentUser: null,
    primaryUser: null,
    isAuthChecked: false,
    users: initialUsers,
    customers: initialCustomers,
    leads: initialLeads,
    deals: initialDeals,
    tasks: initialTasks,
    communications: initialCommunications,
    products: initialProducts,
    customerFiles: initialCustomerFiles,
    serviceRequests: initialServiceRequests,
    proformaInvoices: initialProformaInvoices,
    notifications: initialNotifications,
    settings: initialCompanySettings,
    isSupabaseConnected: false,
    supabaseError: null,
  };
}

let globalState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  const stateToSave = { ...globalState, currentUser: null, primaryUser: null };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  listeners.forEach((listener) => listener());
}

let hasFetchedSupabase = false;

async function syncWithSupabase() {
  const client = getSupabaseClient();
  if (!client || hasFetchedSupabase) return;
  hasFetchedSupabase = true;

  try {
    // 1. Fetch Customers
    const { data: custData, error: custErr } = await client.from('customers').select('*').order('created_at', { ascending: false });
    if (custErr) {
      console.warn('Supabase Customers fetch error:', custErr.message);
      globalState.supabaseError = `خطا در دریافت جدول مشتریان: ${custErr.message}. لطفاً اسکریپت SQL را در Supabase اجرا کنید.`;
      notify();
    } else {
      globalState.customers = (custData || []).map((c: any) => ({
        id: c.id,
        companyName: c.company_name || 'بدون نام شرکت',
        name: c.contact_name || 'بدون نام رابط',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || '',
        customerType: c.customer_type || 'company',
        status: c.status || 'lead',
        tags: [],
        assignedToUserId: c.assigned_to || '',
        lastContactDate: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: c.description || '',
        budget: 0,
        source: 'مستقیم',
        fileCount: 0,
      }));
      globalState.isSupabaseConnected = true;
      globalState.supabaseError = null;
      notify();
    }

    // 2. Fetch Services
    const { data: srvData } = await client.from('services').select('*').order('created_at', { ascending: false });
    if (srvData) {
      globalState.serviceRequests = srvData.map((s: any) => {
        let statusValue: ServiceStatus = 'registered';
        if (s.service_status === 'checking') statusValue = 'diagnosing';
        else if (s.service_status === 'repairing') statusValue = 'in_repair';
        else if (s.service_status === 'completed') statusValue = 'completed';
        else if (['registered', 'diagnosing', 'in_repair', 'waiting_parts', 'completed', 'delivered'].includes(s.service_status)) {
          statusValue = s.service_status as ServiceStatus;
        }

        const relatedCust = globalState.customers.find((c) => c.id === s.customer_id);

        return {
          id: s.id,
          requestNumber: `W-SRV-${s.id.slice(0, 5)}`,
          customerId: s.customer_id || '',
          customerName: relatedCust ? relatedCust.name : 'مشتری تهویه واته',
          companyName: relatedCust ? relatedCust.companyName : 'شرکت ثبت شده',
          deviceModel: s.device_name || 'تجهیزات تهویه',
          serialNumber: 'SN-WAATEH',
          serviceType: 'breakdown',
          issueDescription: s.problem_description || 'نیاز به بررسی تکنسین',
          priority: 'medium',
          status: statusValue,
          assignedTechnicianId: s.assigned_to || '',
          assignedTechnicianName: s.technician || 'کارشناس فنی واته',
          createdAt: s.created_at ? s.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          updatedAt: s.created_at ? s.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        };
      });
      notify();
    }

    // 3. Fetch Deals
    const { data: dealsData } = await client.from('deals').select('*').order('created_at', { ascending: false });
    if (dealsData) {
      globalState.deals = dealsData.map((d: any) => {
        const relatedCust = globalState.customers.find((c) => c.id === d.customer_id);
        return {
          id: d.id,
          title: d.title || 'فرصت فروش واته',
          customerId: d.customer_id || '',
          customerName: relatedCust ? relatedCust.name : 'مشتری خریدار',
          companyName: relatedCust ? relatedCust.companyName : 'شرکت خریدار',
          value: Number(d.value) || 0,
          stage: d.stage || 'negotiation',
          probability: d.stage === 'won' ? 100 : 70,
          expectedCloseDate: new Date().toISOString().split('T')[0],
          assignedToUserId: d.assigned_to || '',
          createdAt: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        };
      });
      notify();
    }

    // 4. Fetch Leads
    const { data: leadsData } = await client.from('leads').select('*').order('created_at', { ascending: false });
    if (leadsData) {
      globalState.leads = leadsData.map((l: any) => ({
        id: l.id,
        title: l.customer_name || 'سرنخ جدید',
        customerName: l.customer_name || '',
        companyName: l.customer_name || '',
        phone: l.phone || '',
        email: '',
        source: l.source || 'استعلام مستقیم',
        stage: l.status === 'converted' ? 'won' : 'initial_contact',
        priority: 'medium',
        dealValue: 0,
        assignedToUserId: l.assigned_to || '',
        createdAt: l.created_at ? l.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: l.notes || '',
      }));
      notify();
    }

    // 5. Fetch Tasks
    const { data: tasksData } = await client.from('tasks').select('*').order('created_at', { ascending: false });
    if (tasksData) {
      globalState.tasks = tasksData.map((t: any) => {
        const relatedCust = globalState.customers.find((c) => c.id === t.customer_id);
        return {
          id: t.id,
          title: t.title || 'پیگیری',
          description: t.description || '',
          customerId: t.customer_id || '',
          customerName: relatedCust ? relatedCust.companyName : '',
          assignedToUserId: t.assigned_to || '',
          dueDate: t.due_date ? t.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
          priority: t.priority || 'medium',
          status: t.status || 'pending',
          type: 'followup',
          createdAt: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        };
      });
      notify();
    }

    // 6. Fetch Products
    const { data: prodsData } = await client.from('products').select('*');
    if (prodsData) {
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

    // 7. Fetch Users
    const { data: usersData } = await client.from('users').select('*');
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

      if (globalState.currentUser) {
        const matched = globalState.users.find(
          (u) =>
            u.id === globalState.currentUser?.id ||
            u.email.trim().toLowerCase() === globalState.currentUser?.email.trim().toLowerCase()
        );
        if (matched) {
          globalState.currentUser = { ...globalState.currentUser, ...matched };
        }
      }

      notify();
    }

  } catch (err: any) {
    console.error('Error syncing Supabase:', err);
  }
}

let authCheckPromise: Promise<void> | null = null;

export async function checkAuthSession() {
  if (globalState.isAuthChecked && authCheckPromise) return authCheckPromise;

  authCheckPromise = (async () => {
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user?.email) {
          const userEmail = session.user.email.trim().toLowerCase();
          let matched = globalState.users.find(
            (u) => u.email.trim().toLowerCase() === userEmail
          );

          if (!matched) {
            const { data: dbUserData } = await client
              .from('users')
              .select('*')
              .ilike('email', userEmail)
              .maybeSingle();

            if (dbUserData) {
              matched = {
                id: dbUserData.id,
                name: dbUserData.name || 'کاربر سیستم',
                email: dbUserData.email || userEmail,
                role: dbUserData.role || 'sales',
                department: dbUserData.department || 'واحد مربوطه',
                phone: dbUserData.phone || '',
                avatar: dbUserData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
                isActive: dbUserData.is_active ?? true,
              };
            }
          }

          if (matched && matched.isActive !== false) {
            globalState.currentUser = matched;
            sessionStorage.setItem('waateh_session_active', JSON.stringify({ email: matched.email }));
          } else {
            globalState.currentUser = null;
            sessionStorage.removeItem('waateh_session_active');
          }
        } else {
          globalState.currentUser = null;
          sessionStorage.removeItem('waateh_session_active');
        }
      } catch (err) {
        console.warn('Error checking auth session:', err);
        globalState.currentUser = null;
        sessionStorage.removeItem('waateh_session_active');
      }
    } else {
      const localAuthSession = sessionStorage.getItem('waateh_session_active');
      if (localAuthSession) {
        try {
          const sessionUser = JSON.parse(localAuthSession);
          if (sessionUser && sessionUser.email) {
            const matched = globalState.users.find(
              (u) => u.email.trim().toLowerCase() === sessionUser.email.trim().toLowerCase()
            );
            if (matched && matched.isActive !== false) {
              globalState.currentUser = matched;
            } else {
              globalState.currentUser = null;
              sessionStorage.removeItem('waateh_session_active');
            }
          }
        } catch {
          globalState.currentUser = null;
          sessionStorage.removeItem('waateh_session_active');
        }
      } else {
        globalState.currentUser = null;
      }
    }

    globalState.isAuthChecked = true;
    notify();
  })();

  return authCheckPromise;
}

export function useCRMStore() {
  const [state, setState] = useState<CRMDataState>(globalState);

  useEffect(() => {
    const handleChange = () => setState({ ...globalState });
    listeners.add(handleChange);

    if (!globalState.isAuthChecked) {
      checkAuthSession();
    }

    if (isSupabaseConfigured && !hasFetchedSupabase) {
      syncWithSupabase();
    }

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  // Auth & User Actions
  const logout = async () => {
    globalState.currentUser = null;
    globalState.primaryUser = null;
    sessionStorage.removeItem('waateh_session_active');
    notify();

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
  };

  const setCurrentUser = (user: User | null) => {
    globalState.currentUser = user;
    globalState.primaryUser = null;
    if (user) {
      sessionStorage.setItem('waateh_session_active', JSON.stringify({ email: user.email }));
    } else {
      sessionStorage.removeItem('waateh_session_active');
    }
    notify();
  };

  const enterUserPanel = (targetUser: User) => {
    if (!globalState.primaryUser && globalState.currentUser) {
      globalState.primaryUser = globalState.currentUser;
    }
    globalState.currentUser = targetUser;
    notify();
  };

  const exitUserPanel = () => {
    if (globalState.primaryUser) {
      globalState.currentUser = globalState.primaryUser;
      globalState.primaryUser = null;
      notify();
    }
  };

  const switchUserRole = (role: User['role']) => {
    const targetUser = globalState.users.find((u) => u.role === role) || globalState.users[0];
    globalState.currentUser = targetUser;
    globalState.primaryUser = null;
    notify();
  };

  const addUser = async (newUser: Omit<User, 'id'>, initialPassword?: string) => {
    const tempId = `user-${Date.now()}`;
    const created: User = {
      ...newUser,
      id: tempId,
    };
    globalState.users.push(created);
    notify();

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured) {
      try {
        let authId: string | null = null;
        if (initialPassword && initialPassword.trim().length >= 6) {
          try {
            const { data: authData } = await client.auth.signUp({
              email: newUser.email,
              password: initialPassword,
            });
            if (authData?.user) {
              authId = authData.user.id;
            }
          } catch (signUpErr) {
            console.warn('Supabase auth.signUp error during addUser:', signUpErr);
          }
        }

        const { data, error } = await client.from('users').insert([
          {
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department || 'واحد فروش و خدمات واته',
            phone: newUser.phone || null,
            avatar: newUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
            position: newUser.position || null,
            is_active: newUser.isActive ?? true,
            ...(authId ? { auth_id: authId } : {}),
          }
        ]).select();

        if (error) {
          let errorMsg = `خطای ثبت: ${error.message}`;
          if (error.message?.includes('users_role_check') || error.code === '23514') {
            errorMsg = 'محدودیت نقش اجازه ثبت این عنوان شغلی را نداد!';
          }
          addNotification({
            title: 'خطای ثبت کاربر',
            message: errorMsg,
            type: 'system',
          });
        } else if (data && data[0]) {
          globalState.users = globalState.users.map((u) =>
            u.id === tempId ? { ...u, id: data[0].id } : u
          );
          notify();
        }
      } catch (e: any) {
        console.error('addUser error:', e);
      }
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    globalState.users = globalState.users.map((u) => {
      if (u.id === userId || (globalState.currentUser && u.email === globalState.currentUser.email)) {
        const updated = { ...u, ...updates };
        if (
          globalState.currentUser?.id === userId ||
          globalState.currentUser?.email.trim().toLowerCase() === u.email.trim().toLowerCase()
        ) {
          globalState.currentUser = updated;
        }
        return updated;
      }
      return u;
    });
    notify();

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured && !userId.startsWith('user-')) {
      try {
        const dbFields: any = {};
        if (updates.name !== undefined) dbFields.name = updates.name;
        if (updates.email !== undefined) dbFields.email = updates.email;
        if (updates.role !== undefined) dbFields.role = updates.role;
        if (updates.department !== undefined) dbFields.department = updates.department;
        if (updates.phone !== undefined) dbFields.phone = updates.phone;
        if (updates.avatar !== undefined) dbFields.avatar = updates.avatar;
        if (updates.position !== undefined) dbFields.position = updates.position;
        if (updates.isActive !== undefined) dbFields.is_active = updates.isActive;

        const { error } = await client.from('users').update(dbFields).eq('id', userId);
        if (error) {
          console.warn('Error updating user in DB:', error);
          let errorMsg = `خطای سیستم: ${error.message}`;
          if (error.message?.includes('users_role_check') || error.code === '23514') {
            errorMsg = 'محدودیت نقش اجازه ثبت این عنوان شغلی را نداد!';
          }
          addNotification({
            title: 'خطای به‌روزرسانی کاربر',
            message: errorMsg,
            type: 'system',
          });
        }
      } catch (e) {
        console.warn('Error updating user in DB:', e);
      }
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    await updateUser(userId, { role });
  };

  const toggleUserActiveStatus = async (userId: string) => {
    const targetUser = globalState.users.find((u) => u.id === userId);
    if (targetUser) {
      await updateUser(userId, { isActive: !targetUser.isActive });
    }
  };

  const deleteUser = async (userId: string) => {
    if (globalState.users.length <= 1) return;
    globalState.users = globalState.users.filter((u) => u.id !== userId);
    if (globalState.currentUser?.id === userId) {
      globalState.currentUser = globalState.users[0];
    }
    notify();

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured && !userId.startsWith('user-')) {
      await client.from('users').delete().eq('id', userId);
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
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('customers').insert([
          {
            company_name: custData.companyName,
            contact_name: custData.name,
            phone: custData.phone,
            email: custData.email || null,
            address: custData.address || null,
            customer_type: custData.customerType || 'company',
            status: custData.status || 'lead',
            description: custData.notes || null,
            assigned_to: custData.assignedToUserId || globalState.currentUser?.id || null,
          }
        ]).select();

        if (error) {
          console.error('Supabase Customers Insert Error:', error);
          addNotification({
            title: 'خطا در ذخیره‌سازی مشتری',
            message: `خطای سیستم: ${error.message}`,
            type: 'task',
          });
        } else if (data && data[0]) {
          const supabaseCustomer = data[0];
          globalState.customers = globalState.customers.map((c) =>
            c.id === tempId ? { ...c, id: supabaseCustomer.id } : c
          );
          notify();
        }
      } catch (err: any) {
        console.error('Exception adding customer to Supabase:', err);
      }
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    globalState.customers = globalState.customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    notify();

    const client = getSupabaseClient();
    if (client && !id.startsWith('cust-')) {
      const dbUpdates: any = {};
      if (updates.companyName) dbUpdates.company_name = updates.companyName;
      if (updates.name) dbUpdates.contact_name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.customerType) dbUpdates.customer_type = updates.customerType;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes) dbUpdates.description = updates.notes;
      if (updates.assignedToUserId) dbUpdates.assigned_to = updates.assignedToUserId;

      await client.from('customers').update(dbUpdates).eq('id', id);
    }
  };

  const deleteCustomer = async (id: string) => {
    globalState.customers = globalState.customers.filter((c) => c.id !== id);
    globalState.deals = globalState.deals.filter((d) => d.customerId !== id);
    globalState.tasks = globalState.tasks.filter((t) => t.customerId !== id);
    globalState.serviceRequests = globalState.serviceRequests.filter((s) => s.customerId !== id);
    notify();

    const client = getSupabaseClient();
    if (client && !id.startsWith('cust-')) {
      await client.from('customers').delete().eq('id', id);
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('services').insert([
          {
            customer_id: srvData.customerId && !srvData.customerId.startsWith('cust-') ? srvData.customerId : null,
            device_name: srvData.deviceModel,
            problem_description: srvData.issueDescription,
            service_status: srvData.status || 'registered',
            technician: srvData.assignedTechnicianName || 'کارشناس فنی واته',
            assigned_to: srvData.assignedTechnicianId || globalState.currentUser?.id || null,
          }
        ]).select();

        if (error) {
          console.error('Supabase Services Insert Error:', error);
          addNotification({
            title: 'خطا در ثبت درخواست خدمات',
            message: `علت خطا: ${error.message}`,
            type: 'task',
          });
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

    const client = getSupabaseClient();
    if (client && !id.startsWith('srv-')) {
      await client.from('services').update({ service_status: status }).eq('id', id);
    }
  };

  const deleteServiceRequest = async (id: string) => {
    globalState.serviceRequests = globalState.serviceRequests.filter((s) => s.id !== id);
    notify();

    const client = getSupabaseClient();
    if (client && !id.startsWith('srv-')) {
      await client.from('services').delete().eq('id', id);
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('leads').insert([
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

    const client = getSupabaseClient();
    if (client && !id.startsWith('lead-')) {
      await client.from('leads').update({
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

    const client = getSupabaseClient();
    if (client) {
      await client.from('deals').insert([
        {
          customer_id: customer.id.startsWith('cust-') ? null : customer.id,
          title: lead.title,
          value: lead.dealValue,
          stage: lead.stage === 'won' ? 'won' : 'negotiation',
          status: 'open',
        }
      ]);
      if (!lead.id.startsWith('lead-')) {
        await client.from('leads').delete().eq('id', lead.id);
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('deals').insert([
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

    const client = getSupabaseClient();
    if (client && !dealId.startsWith('deal-')) {
      await client.from('deals').update({ stage: newStage }).eq('id', dealId);
    }
  };

  const updateDeal = async (dealId: string, updates: Partial<Deal>) => {
    globalState.deals = globalState.deals.map((d) => (d.id === dealId ? { ...d, ...updates } : d));
    notify();

    const client = getSupabaseClient();
    if (client && !dealId.startsWith('deal-')) {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.stage) dbUpdates.stage = updates.stage;
      if (updates.value !== undefined) dbUpdates.value = updates.value;
      if (updates.probability !== undefined) dbUpdates.probability = updates.probability;
      if (updates.expectedCloseDate) dbUpdates.expected_close_date = updates.expectedCloseDate;

      await client.from('deals').update(dbUpdates).eq('id', dealId);
    }
  };

  const deleteDeal = async (dealId: string) => {
    globalState.deals = globalState.deals.filter((d) => d.id !== dealId);
    notify();

    const client = getSupabaseClient();
    if (client && !dealId.startsWith('deal-')) {
      await client.from('deals').delete().eq('id', dealId);
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('tasks').insert([
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

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    globalState.tasks = globalState.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    notify();

    const client = getSupabaseClient();
    if (client && !taskId.startsWith('task-')) {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.customerId && !updates.customerId.startsWith('cust-')) dbUpdates.customer_id = updates.customerId;

      await client.from('tasks').update(dbUpdates).eq('id', taskId);
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

    const client = getSupabaseClient();
    if (client && !taskId.startsWith('task-')) {
      await client.from('tasks').update({ status: nextStatus }).eq('id', taskId);
    }
  };

  const deleteTask = async (taskId: string) => {
    globalState.tasks = globalState.tasks.filter((t) => t.id !== taskId);
    notify();

    const client = getSupabaseClient();
    if (client && !taskId.startsWith('task-')) {
      await client.from('tasks').delete().eq('id', taskId);
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

    const client = getSupabaseClient();
    if (client && commData.customerId && !commData.customerId.startsWith('cust-')) {
      await client.from('customer_contacts').insert([
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('products').insert([
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

    const client = getSupabaseClient();
    if (client && !id.startsWith('prod-')) {
      await client.from('products').delete().eq('id', id);
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

    const client = getSupabaseClient();
    if (client && fileData.customerId && !fileData.customerId.startsWith('cust-')) {
      await client.from('files').insert([
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

    const client = getSupabaseClient();
    if (client && !fileId.startsWith('file-')) {
      await client.from('files').delete().eq('id', fileId);
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

  // Proforma Invoices Actions
  const addProformaInvoice = (pfData: Omit<ProformaInvoice, 'id' | 'createdAt'>) => {
    const newPf: ProformaInvoice = {
      ...pfData,
      id: `pf-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    globalState.proformaInvoices.unshift(newPf);
    addNotification({
      title: 'پیش‌فاکتور جدید صادر شد',
      message: `پیش‌فاکتور ${newPf.number} برای ${newPf.companyName || newPf.customerName} صادر گردید.`,
      type: 'deal',
    });
    notify();
    return newPf;
  };

  const updateProformaInvoice = (id: string, updates: Partial<ProformaInvoice>) => {
    globalState.proformaInvoices = globalState.proformaInvoices.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    notify();
  };

  const updateProformaStatus = (id: string, status: ProformaStatus) => {
    globalState.proformaInvoices = globalState.proformaInvoices.map((p) =>
      p.id === id ? { ...p, status } : p
    );
    const updated = globalState.proformaInvoices.find((p) => p.id === id);
    if (updated) {
      addNotification({
        title: 'تغییر وضعیت پیش‌فاکتور',
        message: `وضعیت پیش‌فاکتور ${updated.number} به‌روزرسانی شد.`,
        type: 'deal',
      });
    }
    notify();
  };

  const deleteProformaInvoice = (id: string) => {
    globalState.proformaInvoices = globalState.proformaInvoices.filter((p) => p.id !== id);
    notify();
  };

  const resetDataToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    hasFetchedSupabase = false;
    globalState = {
      currentUser: null,
      primaryUser: null,
      isAuthChecked: false,
      users: initialUsers,
      customers: initialCustomers,
      leads: initialLeads,
      deals: initialDeals,
      tasks: initialTasks,
      communications: initialCommunications,
      products: initialProducts,
      customerFiles: initialCustomerFiles,
      serviceRequests: initialServiceRequests,
      proformaInvoices: initialProformaInvoices,
      notifications: initialNotifications,
      settings: initialCompanySettings,
      isSupabaseConnected: false,
      supabaseError: null,
    };
    notify();
  };

  // Role Based Filter Helper
  const currentRole = state.currentUser?.role || 'sales';
  const currentUserId = state.currentUser?.id;

  const isAdmin = currentRole === 'admin';
  const isSalesManager = currentRole === 'sales_manager';
  const isSales = currentRole === 'sales';
  const isService = currentRole === 'service';

  // Customers access
  const accessibleCustomers = (isAdmin || isSalesManager)
    ? state.customers
    : isService
    ? state.customers.filter((c) =>
        state.serviceRequests.some((s) => s.customerId === c.id)
      )
    : state.customers.filter((c) => c.assignedToUserId === currentUserId || !c.assignedToUserId);

  // Leads access
  const accessibleLeads = (isAdmin || isSalesManager)
    ? state.leads
    : isSales
    ? state.leads.filter((l) => l.assignedToUserId === currentUserId || !l.assignedToUserId)
    : []; // Service role has no access to leads

  // Deals access
  const accessibleDeals = (isAdmin || isSalesManager)
    ? state.deals
    : isSales
    ? state.deals.filter((d) => d.assignedToUserId === currentUserId || !d.assignedToUserId)
    : []; // Service role has no access to financial deals

  // Tasks access
  const accessibleTasks = (isAdmin || isSalesManager)
    ? state.tasks
    : isService
    ? state.tasks.filter((t) => t.assignedToUserId === currentUserId || t.type === 'other')
    : state.tasks.filter((t) => t.assignedToUserId === currentUserId || !t.assignedToUserId);

  // Services access
  const accessibleServices = (isAdmin || isService)
    ? state.serviceRequests
    : state.serviceRequests.filter((s) => s.assignedTechnicianId === currentUserId || isSalesManager);

  const actualUser = state.primaryUser || state.currentUser;
  const actualIsAdmin = actualUser?.role === 'admin';
  const actualIsSalesManager = actualUser?.role === 'sales_manager';

  const canSwitchToPanel = (targetUser: User) => {
    if (!targetUser) return false;
    if (targetUser.id === state.currentUser?.id) return false;
    if (actualIsAdmin) return true; // Admin can switch to ANY panel
    if (actualIsSalesManager) {
      // Sales Manager can ONLY switch to sales and service staff, NOT admin or other sales_managers
      return targetUser.role === 'sales' || targetUser.role === 'service';
    }
    return false;
  };

  return {
    state,
    currentUser: state.currentUser,
    primaryUser: state.primaryUser,
    isAuthChecked: state.isAuthChecked,
    actualUser,
    actualIsAdmin,
    actualIsSalesManager,
    canSwitchToPanel,
    enterUserPanel,
    exitUserPanel,
    users: state.users,
    isManager: isAdmin || isSalesManager,
    isAdmin,
    isSalesManager,
    isSales,
    isService,
    isSupabaseConnected: state.isSupabaseConnected,
    supabaseError: state.supabaseError,
    setCurrentUser,
    logout,
    switchUserRole,
    addUser,
    updateUser,
    updateUserRole,
    toggleUserActiveStatus,
    deleteUser,
    // Customers
    accessibleCustomers,
    allCustomers: state.customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    // Service Requests
    serviceRequests: accessibleServices,
    allServiceRequests: state.serviceRequests,
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
    updateDeal,
    updateDealStage,
    deleteDeal,
    // Tasks
    accessibleTasks,
    allTasks: state.tasks,
    addTask,
    updateTask,
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
    // Proforma Invoices (پیش‌فاکتورها)
    proformaInvoices: state.proformaInvoices,
    addProformaInvoice,
    updateProformaInvoice,
    updateProformaStatus,
    deleteProformaInvoice,
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
