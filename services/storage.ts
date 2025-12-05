
import { Budget, Client, CompanyProfile, PdfConfig, Product, CloudConfig, SystemType, PdfSystemConfig, ProductKit } from '../types';
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

const KEYS = {
  BUDGETS: 'proquote_budgets',
  CLIENTS: 'proquote_clients',
  PRODUCTS: 'proquote_products',
  KITS: 'proquote_kits',
  COMPANY: 'proquote_company',
  PDF_CONFIG: 'proquote_pdf_config_v2', 
  CLOUD_CONFIG: 'proquote_cloud_config',
  INIT: 'proquote_initialized_v5'
};

// --- LOGOS PRE-CARGADOS ---
const LOGO_AGORA = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI1MCIgZmlsbD0iI2UzMDYxMyIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+w6Fnb3JhPC90ZXh0Pjwvc3ZnPg==";
const LOGO_CONCORD = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI1MCIgZmlsbD0iIzAwOTYzOSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Y29uY29yZDwvdGV4dD48L3N2Zz4=";
const LOGO_CASHLOGY = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI3NSIgZmlsbD0iI2ZmY2QwMCIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Y2FzaGxvZ3k8L3RleHQ+PC9zdmc+";

// DEFAULTS
const DEFAULT_SYSTEM_CONFIG: PdfSystemConfig = {
    primaryColor: '#000000',
    secondaryColor: '#eeeeee',
    showLogo: true, showCompanyDetails: true, showImages: true, showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
    titleText: 'PRESUPUESTO', footerText: 'Gracias por su confianza.',
    legalTextIds: ['tax', 'payment'], customLegalTexts: [], partnerLogos: {}
};

const DEFAULT_PDF_CONFIG: PdfConfig = {
    agora: {
        ...DEFAULT_SYSTEM_CONFIG,
        primaryColor: '#dc2626',
        secondaryColor: '#f8fafc',
        partnerLogos: {
            slot1: LOGO_AGORA,
            slot2: LOGO_CONCORD,
            slot3: LOGO_CASHLOGY
        }
    },
    sage: {
        ...DEFAULT_SYSTEM_CONFIG,
        primaryColor: '#000000',
        secondaryColor: '#e6ffef',
        partnerLogos: {} // Empty for sage by default
    },
    sage200: {
        ...DEFAULT_SYSTEM_CONFIG,
        primaryColor: '#000000',
        secondaryColor: '#e6ffef',
        partnerLogos: {} 
    },
    sagedespachos: {
        ...DEFAULT_SYSTEM_CONFIG,
        primaryColor: '#000000',
        secondaryColor: '#e6ffef',
        partnerLogos: {}
    }
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

// --- FIREBASE SYNC LOGIC (MODULAR SDK v9+) ---
let app: FirebaseApp | undefined;
let db: Firestore | null = null;
let unsubscribeFunctions: Function[] = [];

const initFirebase = async () => {
  let config = loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG);
  
  // Ensure hardcoded credentials are used if local is missing or incorrect
  if (!config.apiKey || config.projectId !== "presupuestos-93a99") {
      config = DEFAULT_CLOUD_CONFIG;
      saveLocal(KEYS.CLOUD_CONFIG, config);
  }
  
  // Clear previous listeners
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
        if (e.code === 'app/duplicate-app') {
            // App already exists, we can ignore
        } else {
            throw e;
        }
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

    // Lists
    startSync('budgets', KEYS.BUDGETS);
    startSync('clients', KEYS.CLIENTS);
    startSync('products', KEYS.PRODUCTS);
    startSync('kits', KEYS.KITS);
    
    // Singletons
    startSyncSingleton('settings', 'company', KEYS.COMPANY);
    
    // PDF Config: Full sync
    const pdfRef = doc(db, 'settings', 'pdf');
    const pdfUnsub = onSnapshot(pdfRef, (docSnap) => {
        if (docSnap.exists()) {
            const cloudData = docSnap.data() as PdfConfig;
            // Merge defaults if new fields added (like sage200)
            const merged = { ...DEFAULT_PDF_CONFIG, ...cloudData };
            saveLocal(KEYS.PDF_CONFIG, merged);
            notify();
        } else {
            // Cloud empty, push local
            const local = loadLocal<PdfConfig>(KEYS.PDF_CONFIG, DEFAULT_PDF_CONFIG);
            setDoc(pdfRef, local).catch(e => console.error("Error pushing pdf config", e));
        }
    });
    unsubscribeFunctions.push(pdfUnsub);
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
        if (localData.length > 0) {
            localData.forEach(item => pushToCloud(collectionName, item));
        }
    }
  }, (error) => {
      console.warn(`Sync warning for ${collectionName}:`, error.message);
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
            // Cloud empty, push local
            const local = loadLocal(localKey, null);
            if(local) {
                setDoc(docRef, local).catch(e => console.error("Error pushing singleton:", e));
            }
        }
    }, (error) => {
        console.warn(`Sync warning for ${collectionName}/${docId}:`, error.message);
    });

    unsubscribeFunctions.push(unsub);
};

const pushToCloud = async (collectionName: string, item: any) => {
  if (!db) return;
  try {
    await setDoc(doc(db, collectionName, item.id), item);
  } catch (e) {
    console.error(`Cloud Push Error (${collectionName})`, e);
  }
};

const deleteFromCloud = async (collectionName: string, id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch(e) {
        console.error("Cloud Delete Error", e);
    }
};


export const storageService = {
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },

  checkAndSeedData: () => {
    const initVersion = localStorage.getItem(KEYS.INIT);
    initFirebase();

    if (initVersion !== 'proquote_initialized_v5') {
        // Reset config to new structure on upgrade
        const currentPdf = loadLocal<PdfConfig>(KEYS.PDF_CONFIG, DEFAULT_PDF_CONFIG);
        const mergedPdf = { ...DEFAULT_PDF_CONFIG, ...currentPdf };
        saveLocal(KEYS.PDF_CONFIG, mergedPdf);
        
        if (!loadLocal(KEYS.CLIENTS, null)) {
             const mockClients: Client[] = [
                { id: '1', commercialName: 'Restaurante El Puerto', legalName: 'Gastronomía del Mar S.L.', cif: 'B12345678', address: 'Av. Marítima 45, Valencia', email: 'info@elpuerto.com', phone: '960123456', paymentMethod: 'Transferencia' }
            ];
            saveLocal(KEYS.CLIENTS, mockClients);
        }

        localStorage.setItem(KEYS.INIT, 'proquote_initialized_v5');
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
          if (e.code === 'permission-denied') return { success: false, message: "Error de Permisos: Habilita 'Test Mode' en Firebase Console." };
          return { success: false, message: `Error: ${e.message}` };
      }
  },

  getBudgets: () => loadLocal<Budget[]>(KEYS.BUDGETS, []),
  saveBudget: (budget: Budget) => {
    const budgets = storageService.getBudgets();
    const index = budgets.findIndex(b => b.id === budget.id);
    if (index >= 0) budgets[index] = budget;
    else budgets.push(budget);
    
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

  getClients: () => loadLocal<Client[]>(KEYS.CLIENTS, []),
  saveClient: (client: Client) => {
    const clients = storageService.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) clients[index] = client;
    else clients.push(client);
    
    saveLocal(KEYS.CLIENTS, clients);
    pushToCloud('clients', client);
    notify();
  },
  deleteClient: (id: string) => {
    saveLocal(KEYS.CLIENTS, storageService.getClients().filter(c => c.id !== id));
    deleteFromCloud('clients', id);
    notify();
  },

  getProducts: () => loadLocal<Product[]>(KEYS.PRODUCTS, []),
  saveProduct: (product: Product) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    
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
    if (index >= 0) kits[index] = kit;
    else kits.push(kit);
    
    saveLocal(KEYS.KITS, kits);
    pushToCloud('kits', kit);
    notify();
  },
  deleteProductKit: (id: string) => {
    saveLocal(KEYS.KITS, storageService.getProductKits().filter(k => k.id !== id));
    deleteFromCloud('kits', id);
    notify();
  },

  getCompanyProfile: () => loadLocal<CompanyProfile>(KEYS.COMPANY, { name: '', cif: '', address: '', email: '', phone: '', terms: '' }),
  saveCompanyProfile: (profile: CompanyProfile) => {
      saveLocal(KEYS.COMPANY, profile);
      if (db) setDoc(doc(db, 'settings', 'company'), profile).catch(e => console.error("Cloud Error", e));
      notify();
  },

  getPdfConfig: () => {
      const config = loadLocal<PdfConfig>(KEYS.PDF_CONFIG, DEFAULT_PDF_CONFIG);
      // Fallback merge for backward compatibility
      if(!config.sage200) config.sage200 = DEFAULT_PDF_CONFIG.sage200;
      if(!config.sagedespachos) config.sagedespachos = DEFAULT_PDF_CONFIG.sagedespachos;
      return config;
  },
  savePdfConfig: (config: PdfConfig) => {
      saveLocal(KEYS.PDF_CONFIG, config);
      if (db) {
          setDoc(doc(db, 'settings', 'pdf'), config).catch(e => console.error("Cloud Error", e));
      }
      notify();
  },
  
  getCloudConfig: () => loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG),
  saveCloudConfig: (config: CloudConfig) => {
      saveLocal(KEYS.CLOUD_CONFIG, config);
      initFirebase(); 
  },

  exportData: () => {
    const data = {
      budgets: storageService.getBudgets(),
      clients: storageService.getClients(),
      products: storageService.getProducts(),
      kits: storageService.getProductKits(),
      company: storageService.getCompanyProfile(),
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
      if(data.pdfConfig) saveLocal(KEYS.PDF_CONFIG, data.pdfConfig);
      notify();
      return true;
    } catch(e) { return false; }
  }
};