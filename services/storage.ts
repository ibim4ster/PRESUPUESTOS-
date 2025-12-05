

import { Budget, Client, CompanyProfile, Product, CloudConfig, SystemType, ProductKit, User, LogEntry, PdfTemplate, PdfConfig, PdfSystemConfig } from '../types';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Firestore 
} from 'firebase/firestore';
import { authService } from './auth';

const KEYS = {
  BUDGETS: 'proquote_budgets',
  CLIENTS: 'proquote_clients',
  PRODUCTS: 'proquote_products',
  KITS: 'proquote_kits',
  COMPANY: 'proquote_company',
  TEMPLATES: 'proquote_pdf_templates',
  CLOUD_CONFIG: 'proquote_cloud_config',
  USERS: 'proquote_users',
  LOGS: 'proquote_logs',
  PDF_CONFIG: 'proquote_pdf_config',
  INIT: 'proquote_initialized_v7'
};

const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  apiKey: "AIzaSyA2PFM21gHn2840SZQ0Bk4tAbM0LxF3ADM",
  authDomain: "presupuestos-93a99.firebaseapp.com",
  projectId: "presupuestos-93a99",
  enabled: true
};

// Event System
type Listener = () => void;
const listeners: Listener[] = [];
const notify = () => listeners.forEach(l => l());

const saveLocal = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to ${key}`, e);
  }
};

const loadLocal = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

// --- FIREBASE SYNC LOGIC ---
let app: FirebaseApp | undefined;
let db: Firestore | null = null;
let unsubscribeFunctions: Function[] = [];

const initFirebase = async () => {
  let config = loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG);
  
  if (!config.apiKey || config.projectId !== "presupuestos-93a99") {
      config = DEFAULT_CLOUD_CONFIG;
      saveLocal(KEYS.CLOUD_CONFIG, config);
  }
  
  unsubscribeFunctions.forEach(unsub => unsub());
  unsubscribeFunctions = [];
  
  if (!config.enabled || !config.apiKey) return;

  try {
    try {
        app = initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId
        });
    } catch (e: any) {
        if (e.code === 'app/duplicate-app') {} else { throw e; }
    }

    if (app) {
        db = getFirestore(app);
        setupListeners();
    }
  } catch (e) {
    console.error("Firebase Init Error", e);
  }
};

const setupListeners = () => {
    if (!db) return;
    startSync('budgets', KEYS.BUDGETS);
    startSync('clients', KEYS.CLIENTS);
    startSync('products', KEYS.PRODUCTS);
    startSync('kits', KEYS.KITS);
    startSync('users', KEYS.USERS);
    startSync('logs', KEYS.LOGS);
    startSync('templates', KEYS.TEMPLATES);
    
    startSyncSingleton('settings', 'company', KEYS.COMPANY);
    startSyncSingleton('settings', 'pdf_config', KEYS.PDF_CONFIG);
};

const startSync = (collectionName: string, localKey: string) => {
  if (!db) return;
  const colRef = collection(db, collectionName);
  const unsub = onSnapshot(colRef, (snapshot) => {
    const cloudData: any[] = [];
    snapshot.forEach(doc => cloudData.push(doc.data()));
    if (cloudData.length > 0 || snapshot.size > 0) { 
        saveLocal(localKey, cloudData);
        notify();
    } else {
        const localData = loadLocal<any[]>(localKey, []);
        if (localData.length > 0) localData.forEach(item => pushToCloud(collectionName, item));
    }
  });
  unsubscribeFunctions.push(unsub);
};

const startSyncSingleton = (collectionName: string, docId: string, localKey: string) => {
    if (!db) return;
    const docRef = doc(db, collectionName, docId);
    const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            saveLocal(localKey, docSnap.data());
            notify();
        } else {
            const local = loadLocal(localKey, null);
            if(local) setDoc(docRef, local).catch(e => console.error(e));
        }
    });
    unsubscribeFunctions.push(unsub);
};

const pushToCloud = async (collectionName: string, item: any) => {
  if (!db) return;
  try { await setDoc(doc(db, collectionName, item.id), item); } catch (e) {}
};

const deleteFromCloud = async (collectionName: string, id: string) => {
    if (!db) return;
    try { await deleteDoc(doc(db, collectionName, id)); } catch(e) {}
};


export const storageService = {
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },

  checkAndSeedData: async () => {
    const initVersion = localStorage.getItem(KEYS.INIT);
    initFirebase();

    if (initVersion !== KEYS.INIT) {
        // Seed Default Templates if none
        const templates = loadLocal<PdfTemplate[]>(KEYS.TEMPLATES, []);
        if (templates.length === 0) {
            const defaultTemplates: PdfTemplate[] = [
                {
                    id: 'tpl-modern', name: 'Corporativo Moderno', isDefault: true,
                    layout: 'modern', font: 'helvetica',
                    primaryColor: '#0f172a', secondaryColor: '#f1f5f9', textColor: '#334155',
                    showLogo: true, showCompanyDetails: true, showClientDetails: true, showImages: true,
                    showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
                    titleText: 'PRESUPUESTO', footerText: 'Gracias por su confianza.',
                    headerHeight: 40, margins: 15
                },
                {
                    id: 'tpl-minimal', name: 'Minimalista Elegante', isDefault: false,
                    layout: 'minimal', font: 'helvetica',
                    primaryColor: '#000000', secondaryColor: '#ffffff', textColor: '#000000',
                    showLogo: true, showCompanyDetails: true, showClientDetails: true, showImages: false,
                    showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
                    titleText: 'PROPUESTA COMERCIAL', footerText: '',
                    headerHeight: 30, margins: 20
                },
                {
                    id: 'tpl-classic', name: 'Clásico Ejecutivo', isDefault: false,
                    layout: 'classic', font: 'times',
                    primaryColor: '#1e3a8a', secondaryColor: '#eff6ff', textColor: '#1e293b',
                    showLogo: true, showCompanyDetails: true, showClientDetails: true, showImages: true,
                    showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
                    titleText: 'PRESUPUESTO', footerText: 'Documento generado electrónicamente.',
                    headerHeight: 50, margins: 15
                }
            ];
            saveLocal(KEYS.TEMPLATES, defaultTemplates);
            defaultTemplates.forEach(t => pushToCloud('templates', t));
        }

        if (!loadLocal(KEYS.CLIENTS, null)) {
             const mockClients: Client[] = [
                { id: '1', commercialName: 'Restaurante El Puerto', legalName: 'Gastronomía del Mar S.L.', cif: 'B12345678', address: 'Av. Marítima 45, Valencia', email: 'info@elpuerto.com', phone: '960123456', paymentMethod: 'Transferencia' }
            ];
            saveLocal(KEYS.CLIENTS, mockClients);
        }

        localStorage.setItem(KEYS.INIT, KEYS.INIT);
    }

    // CHECK USERS - CREATE DEFAULT ADMIN
    const users = loadLocal<User[]>(KEYS.USERS, []);
    if (users.length === 0) {
        const adminHash = await authService.hashPassword('LSSlss0711');
        const adminUser: User = {
            id: 'admin-001', username: 'admin', name: 'Super Administrator', role: 'admin',
            passwordHash: adminHash, createdAt: new Date().toISOString()
        };
        saveLocal(KEYS.USERS, [adminUser]);
        pushToCloud('users', adminUser);
        notify();
    }
  },

  testConnection: async (): Promise<{success: boolean, message: string}> => {
      if (!db) return { success: false, message: "Iniciando Firebase..." };
      try {
          const testRef = doc(db, '_connection_test', 'test');
          await setDoc(testRef, { timestamp: new Date().toISOString() });
          await deleteDoc(testRef);
          return { success: true, message: "Conexión exitosa. Sincronización activa." };
      } catch (e: any) {
          if (e.code === 'permission-denied') return { success: false, message: "Error de Permisos." };
          return { success: false, message: `Error: ${e.message}` };
      }
  },

  addLog: (entry: Partial<LogEntry>) => {
      const logs = storageService.getLogs();
      const newEntry: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          userId: entry.userId || 'system',
          userName: entry.userName || 'Sistema',
          action: entry.action || 'UNKNOWN',
          details: entry.details || ''
      };
      if (logs.length > 200) logs.pop();
      logs.unshift(newEntry);
      saveLocal(KEYS.LOGS, logs);
      pushToCloud('logs', newEntry);
      notify();
  },

  getLogs: () => loadLocal<LogEntry[]>(KEYS.LOGS, []),

  // USERS
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
    const users = storageService.getUsers().filter(u => u.id !== id);
    saveLocal(KEYS.USERS, users);
    deleteFromCloud('users', id);
    notify();
  },

  // BUDGETS
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
    const filtered = storageService.getBudgets().filter(b => b.id !== id);
    saveLocal(KEYS.BUDGETS, filtered);
    deleteFromCloud('budgets', id); 
    notify();
  },

  getNextBudgetNumber: (system: SystemType): string => {
    const budgets = storageService.getBudgets();
    const year = new Date().getFullYear();
    const prefix = `PRE-${year}-`;
    const numbers = budgets
      .map(b => b.number)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.split('-')[2] || '0'));
    const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
    return `${prefix}${next.toString().padStart(3, '0')}`;
  },

  // CLIENTS
  getClients: () => loadLocal<Client[]>(KEYS.CLIENTS, []),
  saveClient: (client: Client) => {
    const clients = storageService.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) clients[index] = client; else clients.push(client);
    saveLocal(KEYS.CLIENTS, clients);
    pushToCloud('clients', client);
    notify();
  },
  deleteClient: (id: string) => {
    saveLocal(KEYS.CLIENTS, storageService.getClients().filter(c => c.id !== id));
    deleteFromCloud('clients', id);
    notify();
  },

  // PRODUCTS & KITS
  getProducts: () => loadLocal<Product[]>(KEYS.PRODUCTS, []),
  saveProduct: (product: Product) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product; else products.push(product);
    saveLocal(KEYS.PRODUCTS, products);
    pushToCloud('products', product);
    notify();
  },
  deleteProduct: (id: string) => {
    saveLocal(KEYS.PRODUCTS, storageService.getProducts().filter(p => p.id !== id));
    deleteFromCloud('products', id);
    notify();
  },

  getProductKits: () => loadLocal<ProductKit[]>(KEYS.KITS, []),
  saveProductKit: (kit: ProductKit) => {
    const kits = storageService.getProductKits();
    const index = kits.findIndex(k => k.id === kit.id);
    if (index >= 0) kits[index] = kit; else kits.push(kit);
    saveLocal(KEYS.KITS, kits);
    pushToCloud('kits', kit);
    notify();
  },
  deleteProductKit: (id: string) => {
    saveLocal(KEYS.KITS, storageService.getProductKits().filter(k => k.id !== id));
    deleteFromCloud('kits', id);
    notify();
  },

  // TEMPLATES (NEW)
  getTemplates: () => loadLocal<PdfTemplate[]>(KEYS.TEMPLATES, []),
  saveTemplate: (template: PdfTemplate) => {
      const templates = storageService.getTemplates();
      // If setting default, unset others
      if(template.isDefault) {
          templates.forEach(t => { if(t.id !== template.id) t.isDefault = false; });
      }
      const index = templates.findIndex(t => t.id === template.id);
      if(index >= 0) templates[index] = template; else templates.push(template);
      saveLocal(KEYS.TEMPLATES, templates);
      pushToCloud('templates', template);
      notify();
  },
  deleteTemplate: (id: string) => {
      const templates = storageService.getTemplates();
      if(templates.length <= 1) return; // Prevent deleting last template
      const filtered = templates.filter(t => t.id !== id);
      saveLocal(KEYS.TEMPLATES, filtered);
      deleteFromCloud('templates', id);
      notify();
  },

  // SETTINGS
  getCompanyProfile: () => loadLocal<CompanyProfile>(KEYS.COMPANY, { name: '', cif: '', address: '', email: '', phone: '', terms: '' }),
  saveCompanyProfile: (profile: CompanyProfile) => {
      saveLocal(KEYS.COMPANY, profile);
      if (db) setDoc(doc(db, 'settings', 'company'), profile).catch(e => console.error(e));
      notify();
  },
  
  getPdfConfig: (): PdfConfig => {
      const defaultSys: PdfSystemConfig = {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          titleText: 'PRESUPUESTO',
          showLogo: true, showCompanyDetails: true, showImages: true,
          showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
          legalTextIds: [], customLegalTexts: [], footerText: '',
          partnerLogos: {}
      };
      const defaults: PdfConfig = {
          agora: { ...defaultSys, primaryColor: '#dc2626' },
          sage: { ...defaultSys, primaryColor: '#00d061' },
          sage200: { ...defaultSys, primaryColor: '#00d061' },
          sagedespachos: { ...defaultSys, primaryColor: '#00d061' }
      };
      return loadLocal(KEYS.PDF_CONFIG, defaults);
  },
  savePdfConfig: (config: PdfConfig) => {
      saveLocal(KEYS.PDF_CONFIG, config);
      if(db) setDoc(doc(db, 'settings', 'pdf_config'), config).catch(e => console.error(e));
      notify();
  },
  
  getCloudConfig: () => loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG),
  saveCloudConfig: (config: CloudConfig) => {
      saveLocal(KEYS.CLOUD_CONFIG, config);
      initFirebase(); 
  },

  // IO
  exportData: () => {
    const data = {
      budgets: storageService.getBudgets(),
      clients: storageService.getClients(),
      products: storageService.getProducts(),
      kits: storageService.getProductKits(),
      company: storageService.getCompanyProfile(),
      templates: storageService.getTemplates(),
      users: storageService.getUsers(),
      logs: storageService.getLogs(),
      pdfConfig: storageService.getPdfConfig()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gravity_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },
  
  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if(data.budgets) saveLocal(KEYS.BUDGETS, data.budgets);
      if(data.clients) saveLocal(KEYS.CLIENTS, data.clients);
      if(data.products) saveLocal(KEYS.PRODUCTS, data.products);
      if(data.kits) saveLocal(KEYS.KITS, data.kits);
      if(data.company) saveLocal(KEYS.COMPANY, data.company);
      if(data.templates) saveLocal(KEYS.TEMPLATES, data.templates);
      if(data.users) saveLocal(KEYS.USERS, data.users);
      if(data.logs) saveLocal(KEYS.LOGS, data.logs);
      if(data.pdfConfig) saveLocal(KEYS.PDF_CONFIG, data.pdfConfig);
      notify();
      return true;
    } catch(e) { return false; }
  }
};
