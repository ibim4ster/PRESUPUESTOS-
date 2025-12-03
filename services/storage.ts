
import { Budget, Client, CompanyProfile, PdfConfig, Product, CloudConfig, SystemType } from '../types';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';

const KEYS = {
  BUDGETS: 'proquote_budgets',
  CLIENTS: 'proquote_clients',
  PRODUCTS: 'proquote_products',
  COMPANY: 'proquote_company',
  PDF_CONFIG: 'proquote_pdf_config',
  CLOUD_CONFIG: 'proquote_cloud_config',
  INIT: 'proquote_initialized_v4' // Bumped version
};

// --- LOGOS PRE-CARGADOS (SVG BASE64) ---
const LOGO_AGORA = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI1MCIgZmlsbD0iI2UzMDYxMyIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+w6Fnb3JhPC90ZXh0Pjwvc3ZnPg==";
const LOGO_CONCORD = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI1MCIgZmlsbD0iIzAwOTYzOSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Y29uY29yZDwvdGV4dD48L3N2Zz4=";
const LOGO_CASHLOGY = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgNDAiPjx0ZXh0IHk9IjMwIiB4PSI3NSIgZmlsbD0iI2ZmY2QwMCIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Y2FzaGxvZ3k8L3RleHQ+PC9zdmc+";

// TUS CLAVES DE FIREBASE
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
let db: any = null;
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
    if (getApps().length > 0) {
      const existingApp = getApps()[0];
      if (existingApp.options.apiKey !== config.apiKey) {
          await deleteApp(existingApp);
      } else {
          db = getFirestore(existingApp);
          startSync('budgets', KEYS.BUDGETS);
          startSync('clients', KEYS.CLIENTS);
          startSync('products', KEYS.PRODUCTS);
          return;
      }
    }
    
    const app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId
    });
    db = getFirestore(app);
    console.log("🔥 Firebase Connected to", config.projectId);
    
    startSync('budgets', KEYS.BUDGETS);
    startSync('clients', KEYS.CLIENTS);
    startSync('products', KEYS.PRODUCTS);
    
  } catch (e) {
    console.error("Firebase Init Error", e);
  }
};

const startSync = (collectionName: string, localKey: string) => {
  if (!db) return;
  
  const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
    const cloudData: any[] = [];
    snapshot.forEach(doc => cloudData.push(doc.data()));
    
    if (cloudData.length > 0) {
        saveLocal(localKey, cloudData);
        notify();
        console.log(`☁️ Synced ${collectionName} from cloud (${cloudData.length} items)`);
    } else {
        const localData = loadLocal<any[]>(localKey, []);
        if (localData.length > 0) {
            console.log(`☁️ Initial push for ${collectionName}`);
            localData.forEach(item => pushToCloud(collectionName, item));
        }
    }
  }, (error) => {
      console.warn(`Sync warning for ${collectionName}:`, error.message);
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

    if (initVersion !== 'proquote_initialized_v4') {
        const currentPdfConfig = loadLocal<PdfConfig>(KEYS.PDF_CONFIG, {
            primaryColor: '#dc2626', secondaryColor: '#f8fafc',
            sagePrimaryColor: '#000000', sageSecondaryColor: '#e6ffef', // SAGE DEFAULTS
            headingFont: 'helvetica', bodyFont: 'helvetica',
            showLogo: true, showCompanyDetails: true, showImages: true, showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
            titleText: 'PRESUPUESTO', footerText: 'Gracias por su confianza.',
            legalTextIds: ['tax', 'payment'], customLegalTexts: [], partnerLogos: {}
        });

        // Seed logos (Removed Logic)
        currentPdfConfig.partnerLogos = {
            agora: LOGO_AGORA,
            concord: LOGO_CONCORD,
            cashloogy: LOGO_CASHLOGY
        };
        // Add sage defaults if missing
        if(!currentPdfConfig.sagePrimaryColor) currentPdfConfig.sagePrimaryColor = '#000000';
        if(!currentPdfConfig.sageSecondaryColor) currentPdfConfig.sageSecondaryColor = '#e6ffef';

        saveLocal(KEYS.PDF_CONFIG, currentPdfConfig);
        
        if (!loadLocal(KEYS.CLIENTS, null)) {
             const mockClients: Client[] = [
                { id: '1', commercialName: 'Restaurante El Puerto', legalName: 'Gastronomía del Mar S.L.', cif: 'B12345678', address: 'Av. Marítima 45, Valencia', email: 'info@elpuerto.com', phone: '960123456', paymentMethod: 'Transferencia' }
            ];
            saveLocal(KEYS.CLIENTS, mockClients);
        }

        localStorage.setItem(KEYS.INIT, 'proquote_initialized_v4');
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
          console.error(e);
          if (e.code === 'permission-denied') return { success: false, message: "Error de Permisos: Habilita 'Test Mode' en Firebase Console." };
          if (e.code === 'unavailable') return { success: false, message: "Error de Red: No hay internet." };
          return { success: false, message: `Error: ${e.message}` };
      }
  },

  // Budgets
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
    // Use system specific prefix? User asked for "Different budgets", kept it simple shared numbering per year
    // but we can make it distinct if needed. Let's make it PRE-{YEAR}-... for all for continuity unless asked.
    const prefix = `PRE-${year}-`;
    const numbers = budgets
      .map(b => b.number)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.split('-')[2] || '0'));
    const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
    return `${prefix}${next.toString().padStart(3, '0')}`;
  },

  // Clients
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

  // Products
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

  // Configs
  getCompanyProfile: () => loadLocal<CompanyProfile>(KEYS.COMPANY, { name: '', cif: '', address: '', email: '', phone: '', terms: '' }),
  saveCompanyProfile: (profile: CompanyProfile) => saveLocal(KEYS.COMPANY, profile),

  getPdfConfig: () => loadLocal<PdfConfig>(KEYS.PDF_CONFIG, {
    primaryColor: '#dc2626', secondaryColor: '#f8fafc',
    sagePrimaryColor: '#000000', sageSecondaryColor: '#e6ffef',
    headingFont: 'helvetica', bodyFont: 'helvetica',
    showLogo: true, showCompanyDetails: true, showImages: true, showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
    titleText: 'PRESUPUESTO', footerText: 'Gracias por su confianza.',
    legalTextIds: ['tax', 'payment'], customLegalTexts: [], partnerLogos: {}
  }),
  savePdfConfig: (config: PdfConfig) => saveLocal(KEYS.PDF_CONFIG, config),
  
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
      company: storageService.getCompanyProfile(),
      pdfConfig: storageService.getPdfConfig()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_proquote_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },
  
  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if(data.budgets) saveLocal(KEYS.BUDGETS, data.budgets);
      if(data.clients) saveLocal(KEYS.CLIENTS, data.clients);
      if(data.products) saveLocal(KEYS.PRODUCTS, data.products);
      if(data.company) saveLocal(KEYS.COMPANY, data.company);
      if(data.pdfConfig) saveLocal(KEYS.PDF_CONFIG, data.pdfConfig);
      return true;
    } catch(e) { return false; }
  }
};
