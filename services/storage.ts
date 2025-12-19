
import { Budget, Client, CompanyProfile, PdfConfig, Product, CloudConfig, SystemType, PdfSystemConfig, ProductKit, User, LogEntry, Task, Expense, EmailTemplate } from '../types';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Firestore,
  QuerySnapshot,
  DocumentData 
} from 'firebase/firestore';
import { authService } from './auth';

const KEYS = {
  BUDGETS: 'proquote_budgets',
  CLIENTS: 'proquote_clients',
  PRODUCTS: 'proquote_products',
  KITS: 'proquote_kits',
  TASKS: 'proquote_tasks', 
  EXPENSES: 'proquote_expenses', 
  TEMPLATES: 'proquote_email_templates', 
  COMPANY: 'proquote_company',
  PDF_CONFIG: 'proquote_pdf_config_v2', 
  CLOUD_CONFIG: 'proquote_cloud_config',
  USERS: 'proquote_users',
  LOGS: 'proquote_logs',
  INIT: 'proquote_initialized_v12'
};

const LOGO_AGORA = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI1MCIgZmlsbD0iI2UzMDYxMyIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+w6Fnb3JhPC90ZXh0Pjwvc3ZnPg==";
const LOGO_CONCORD = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI1MCIgZmlsbD0iIzAwOTYzOSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Y29uY29yZDwvdGV4dD48L3N2Zz4=";
const LOGO_CASHLOGY = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI3NSIgZmlsbD0iI2ZmY2QwMCIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Y29uY29yZDwvdGV4dD48L3N2Zz4=";

const DEFAULT_SYSTEM_CONFIG: PdfSystemConfig = {
    primaryColor: '#000000',
    secondaryColor: '#eeeeee',
    showCoverPage: true, coverTitle: 'PROPUESTA COMERCIAL', coverSubtitle: 'Soluciones Tecnológicas Avanzadas',
    showLogo: true, showCompanyDetails: true, showImages: true, showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
    titleText: 'PRESUPUESTO', footerText: 'Gracias por su confianza.',
    legalTextIds: ['tax', 'payment'], customLegalTexts: [], partnerLogos: {}
};

const DEFAULT_PDF_CONFIG: PdfConfig = {
    agora: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#dc2626', secondaryColor: '#f8fafc', partnerLogos: { slot1: LOGO_AGORA, slot2: LOGO_CONCORD, slot3: LOGO_CASHLOGY } },
    sage: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#000000', secondaryColor: '#e6ffef', partnerLogos: {} },
    sage200: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#000000', secondaryColor: '#e6ffef', partnerLogos: {} },
    sagedespachos: { ...DEFAULT_SYSTEM_CONFIG, primaryColor: '#000000', secondaryColor: '#e6ffef', partnerLogos: {} }
};

const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  apiKey: "AIzaSyA2PFM21gHn2840SZQ0Bk4tAbM0LxF3ADM",
  authDomain: "presupuestos-93a99.firebaseapp.com",
  projectId: "presupuestos-93a99",
  enabled: true
};

type Listener = () => void;
const listeners: Listener[] = [];
const notify = () => listeners.forEach(l => l());

const saveLocal = (key: string, data: any) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {} };
const loadLocal = <T>(key: string, fallback: T): T => { try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : fallback; } catch (e) { return fallback; } };

let app: FirebaseApp | undefined;
let db: Firestore | null = null;
let unsubscribeFunctions: Function[] = [];

const initFirebase = async () => {
  let config = loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG);
  if (!config.apiKey || config.projectId !== "presupuestos-93a99") { config = DEFAULT_CLOUD_CONFIG; saveLocal(KEYS.CLOUD_CONFIG, config); }
  unsubscribeFunctions.forEach(unsub => unsub());
  unsubscribeFunctions = [];
  if (!config.enabled || !config.apiKey) return;
  try {
    try { app = initializeApp({ apiKey: config.apiKey, authDomain: config.authDomain, projectId: config.projectId }); } catch (e: any) {}
    if (app) { db = getFirestore(app); setupListeners(); }
  } catch (e) {}
};

const setupListeners = () => {
    if (!db) return;
    startSync('budgets', KEYS.BUDGETS);
    startSync('clients', KEYS.CLIENTS);
    startSync('products', KEYS.PRODUCTS);
    startSync('kits', KEYS.KITS);
    startSync('tasks', KEYS.TASKS);
    startSync('expenses', KEYS.EXPENSES);
    startSync('templates', KEYS.TEMPLATES);
    startSync('users', KEYS.USERS);
    startSync('logs', KEYS.LOGS);
    startSyncSingleton('settings', 'company', KEYS.COMPANY);
    const pdfRef = doc(db, 'settings', 'pdf');
    const pdfUnsub = onSnapshot(pdfRef, (docSnap) => {
        if (docSnap.exists()) { saveLocal(KEYS.PDF_CONFIG, { ...DEFAULT_PDF_CONFIG, ...docSnap.data() }); notify(); } 
        else { setDoc(pdfRef, loadLocal<PdfConfig>(KEYS.PDF_CONFIG, DEFAULT_PDF_CONFIG)).catch(() => {}); }
    });
    unsubscribeFunctions.push(pdfUnsub);
};

const startSync = (collectionName: string, localKey: string) => {
  if (!db) return;
  const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
    const cloudData: any[] = [];
    snapshot.forEach(doc => cloudData.push(doc.data()));
    if (cloudData.length > 0 || snapshot.size > 0) { saveLocal(localKey, cloudData); notify(); }
    else { const localData = loadLocal<any[]>(localKey, []); if (localData.length > 0) localData.forEach(item => pushToCloud(collectionName, item)); }
  });
  unsubscribeFunctions.push(unsub);
};

const startSyncSingleton = (collectionName: string, docId: string, localKey: string) => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, collectionName, docId), (docSnap) => {
        if (docSnap.exists()) { saveLocal(localKey, docSnap.data()); notify(); }
        else { const local = loadLocal(localKey, null); if(local) setDoc(doc(db, collectionName, docId), local).catch(() => {}); }
    });
    unsubscribeFunctions.push(unsub);
};

const pushToCloud = async (collectionName: string, item: any) => { if (db) await setDoc(doc(db, collectionName, item.id), item).catch(() => {}); };
const deleteFromCloud = async (collectionName: string, id: string) => { if (db) await deleteDoc(doc(db, collectionName, id)).catch(() => {}); };

export const storageService = {
  subscribe: (listener: Listener) => { listeners.push(listener); return () => { const idx = listeners.indexOf(listener); if (idx > -1) listeners.splice(idx, 1); }; },
  checkAndSeedData: async () => {
    const initVersion = localStorage.getItem(KEYS.INIT);
    initFirebase();
    if (initVersion !== KEYS.INIT) { localStorage.setItem(KEYS.INIT, KEYS.INIT); }
    const users = loadLocal<User[]>(KEYS.USERS, []);
    if (users.length === 0) {
        // ACTUALIZACIÓN: Contraseña inicial 'admin'
        const adminHash = await authService.hashPassword('admin');
        const adminUser: User = {
            id: 'admin-001', username: 'admin', name: 'Super Administrator', role: 'admin',
            passwordHash: adminHash, createdAt: new Date().toISOString(), lastPasswordChange: new Date().toISOString()
        };
        saveLocal(KEYS.USERS, [adminUser]);
        pushToCloud('users', adminUser);
        notify();
    }
  },
  testConnection: async () => {
      if (!db) return { success: false, message: "Iniciando Firebase..." };
      try {
          const testRef = doc(db, '_connection_test', 'test');
          await setDoc(testRef, { timestamp: new Date().toISOString() });
          await deleteDoc(testRef);
          return { success: true, message: "Conexión exitosa. Sincronización activa." };
      } catch (e: any) { return { success: false, message: `Error: ${e.message}` }; }
  },
  addLog: (entry: Partial<LogEntry>) => {
      const logs = storageService.getLogs();
      const newEntry: LogEntry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), userId: entry.userId || 'system', userName: entry.userName || 'Sistema', action: entry.action || 'UNKNOWN', details: entry.details || '' };
      if (logs.length > 200) logs.pop();
      logs.unshift(newEntry);
      saveLocal(KEYS.LOGS, logs);
      pushToCloud('logs', newEntry);
      notify();
  },
  getLogs: () => loadLocal<LogEntry[]>(KEYS.LOGS, []),
  getUsers: () => loadLocal<User[]>(KEYS.USERS, []),
  saveUser: (user: User) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user; else users.push(user);
    saveLocal(KEYS.USERS, users);
    pushToCloud('users', user);
    notify();
  },
  deleteUser: (id: string) => {
    saveLocal(KEYS.USERS, storageService.getUsers().filter(u => u.id !== id));
    deleteFromCloud('users', id);
    notify();
  },
  getBudgets: () => loadLocal<Budget[]>(KEYS.BUDGETS, []),
  saveBudget: (budget: Budget) => {
    const budgets = storageService.getBudgets();
    const index = budgets.findIndex(b => b.id === budget.id);
    if (index >= 0) budgets[index] = budget; else budgets.push(budget);
    saveLocal(KEYS.BUDGETS, budgets);
    pushToCloud('budgets', budget); 
    notify();
  },
  deleteBudget: (id: string) => {
    saveLocal(KEYS.BUDGETS, storageService.getBudgets().filter(b => b.id !== id));
    deleteFromCloud('budgets', id); 
    notify();
  },
  getNextBudgetNumber: (system: SystemType): string => {
    const budgets = storageService.getBudgets();
    const year = new Date().getFullYear();
    const prefix = `PRE-${year}-`;
    const numbers = budgets.map(b => b.number).filter(n => n.startsWith(prefix)).map(n => parseInt(n.split('-')[2] || '0'));
    const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
    return `${prefix}${next.toString().padStart(3, '0')}`;
  },
  getClients: () => loadLocal<Client[]>(KEYS.CLIENTS, []),
  saveClient: (client: Client) => {
    const clients = storageService.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) clients[index] = client; else clients.push(client);
    saveLocal(KEYS.CLIENTS, clients);
    pushToCloud('clients', client);
    notify();
  },
  deleteClient: (id: string) => { saveLocal(KEYS.CLIENTS, storageService.getClients().filter(c => c.id !== id)); deleteFromCloud('clients', id); notify(); },
  getProducts: () => loadLocal<Product[]>(KEYS.PRODUCTS, []),
  saveProduct: (product: Product) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product; else products.push(product);
    saveLocal(KEYS.PRODUCTS, products);
    pushToCloud('products', product);
    notify();
  },
  deleteProduct: (id: string) => { saveLocal(KEYS.PRODUCTS, storageService.getProducts().filter(p => p.id !== id)); deleteFromCloud('products', id); notify(); },
  getProductKits: () => loadLocal<ProductKit[]>(KEYS.KITS, []),
  saveProductKit: (kit: ProductKit) => {
    const kits = storageService.getProductKits();
    const index = kits.findIndex(k => k.id === kit.id);
    if (index >= 0) kits[index] = kit; else kits.push(kit);
    saveLocal(KEYS.KITS, kits);
    pushToCloud('kits', kit);
    notify();
  },
  deleteProductKit: (id: string) => { saveLocal(KEYS.KITS, storageService.getProductKits().filter(k => k.id !== id)); deleteFromCloud('kits', id); notify(); },
  getTasks: () => loadLocal<Task[]>(KEYS.TASKS, []),
  saveTask: (task: Task) => {
      const tasks = storageService.getTasks();
      const index = tasks.findIndex(t => t.id === task.id);
      if (index >= 0) tasks[index] = task; else tasks.push(task);
      saveLocal(KEYS.TASKS, tasks);
      pushToCloud('tasks', task);
      notify();
  },
  deleteTask: (id: string) => { saveLocal(KEYS.TASKS, storageService.getTasks().filter(t => t.id !== id)); deleteFromCloud('tasks', id); notify(); },
  getExpenses: () => loadLocal<Expense[]>(KEYS.EXPENSES, []),
  saveExpense: (expense: Expense) => {
      const expenses = storageService.getExpenses();
      const index = expenses.findIndex(e => e.id === expense.id);
      if (index >= 0) expenses[index] = expense; else expenses.push(expense);
      saveLocal(KEYS.EXPENSES, expenses);
      pushToCloud('expenses', expense);
      notify();
  },
  deleteExpense: (id: string) => { saveLocal(KEYS.EXPENSES, storageService.getExpenses().filter(e => e.id !== id)); deleteFromCloud('expenses', id); notify(); },
  getTemplates: () => loadLocal<EmailTemplate[]>(KEYS.TEMPLATES, []),
  saveTemplate: (tpl: EmailTemplate) => {
      const tpls = storageService.getTemplates();
      const index = tpls.findIndex(t => t.id === tpl.id);
      if(index >= 0) tpls[index] = tpl; else tpls.push(tpl);
      saveLocal(KEYS.TEMPLATES, tpls);
      pushToCloud('templates', tpl);
      notify();
  },
  deleteTemplate: (id: string) => { saveLocal(KEYS.TEMPLATES, storageService.getTemplates().filter(t => t.id !== id)); deleteFromCloud('templates', id); notify(); },
  getCompanyProfile: () => loadLocal<CompanyProfile>(KEYS.COMPANY, { name: '', cif: '', address: '', email: '', phone: '', terms: '' }),
  saveCompanyProfile: (profile: CompanyProfile) => { saveLocal(KEYS.COMPANY, profile); if (db) setDoc(doc(db, 'settings', 'company'), profile).catch(() => {}); notify(); },
  getPdfConfig: () => loadLocal<PdfConfig>(KEYS.PDF_CONFIG, DEFAULT_PDF_CONFIG),
  savePdfConfig: (config: PdfConfig) => { saveLocal(KEYS.PDF_CONFIG, config); if (db) setDoc(doc(db, 'settings', 'pdf'), config).catch(() => {}); notify(); },
  getCloudConfig: () => loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG),
  saveCloudConfig: (config: CloudConfig) => { saveLocal(KEYS.CLOUD_CONFIG, config); initFirebase(); },
  exportData: () => {
    const data = { budgets: storageService.getBudgets(), clients: storageService.getClients(), products: storageService.getProducts(), kits: storageService.getProductKits(), tasks: storageService.getTasks(), expenses: storageService.getExpenses(), templates: storageService.getTemplates(), company: storageService.getCompanyProfile(), pdfConfig: storageService.getPdfConfig(), users: storageService.getUsers(), logs: storageService.getLogs() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `backup_gravity_${new Date().toISOString().split('T')[0]}.json`; a.click();
  },
  importData: (jsonData: string) => { try { const data = JSON.parse(jsonData); if(data.budgets) saveLocal(KEYS.BUDGETS, data.budgets); if(data.clients) saveLocal(KEYS.CLIENTS, data.clients); if(data.products) saveLocal(KEYS.PRODUCTS, data.products); if(data.kits) saveLocal(KEYS.KITS, data.kits); if(data.tasks) saveLocal(KEYS.TASKS, data.tasks); if(data.expenses) saveLocal(KEYS.EXPENSES, data.expenses); if(data.templates) saveLocal(KEYS.TEMPLATES, data.templates); if(data.company) saveLocal(KEYS.COMPANY, data.company); if(data.pdfConfig) saveLocal(KEYS.PDF_CONFIG, data.pdfConfig); if(data.users) saveLocal(KEYS.USERS, data.users); if(data.logs) saveLocal(KEYS.LOGS, data.logs); notify(); return true; } catch(e) { return false; } }
};
