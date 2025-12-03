
import { Budget, Client, CompanyProfile, PdfConfig, Product, CloudConfig } from '../types';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';

const KEYS = {
  BUDGETS: 'proquote_budgets',
  CLIENTS: 'proquote_clients',
  PRODUCTS: 'proquote_products',
  COMPANY: 'proquote_company',
  PDF_CONFIG: 'proquote_pdf_config',
  CLOUD_CONFIG: 'proquote_cloud_config',
  INIT: 'proquote_initialized_v2'
};

// TUS CLAVES DE FIREBASE (Configuradas por defecto)
const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  apiKey: "AIzaSyA2PFM21gHn2840SZQ0Bk4tAbM0LxF3ADM",
  authDomain: "presupuestos-93a99.firebaseapp.com",
  projectId: "presupuestos-93a99",
  enabled: true // Activado por defecto
};

// Event System for Reactivity
type Listener = () => void;
const listeners: Listener[] = [];
const notify = () => listeners.forEach(l => l());

// Generic helper
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
  // Load local config, but fallback to your hardcoded credentials
  const config = loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG);
  
  // Cleanup previous connections
  unsubscribeFunctions.forEach(unsub => unsub());
  unsubscribeFunctions = [];
  
  if (!config.enabled || !config.apiKey) return;

  try {
    if (getApps().length > 0) {
      await deleteApp(getApps()[0]);
    }
    
    const app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId
    });
    db = getFirestore(app);
    console.log("🔥 Firebase Connected to", config.projectId);
    
    // Start Listeners
    startSync('budgets', KEYS.BUDGETS);
    startSync('clients', KEYS.CLIENTS);
    startSync('products', KEYS.PRODUCTS);
    
  } catch (e) {
    console.error("Firebase Init Error", e);
  }
};

const startSync = (collectionName: string, localKey: string) => {
  if (!db) return;
  
  // Real-time listener: Cloud -> Local
  const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
    const cloudData: any[] = [];
    snapshot.forEach(doc => cloudData.push(doc.data()));
    
    // If we have data in cloud, sync it down
    // Note: In a real robust app, you'd do timestamp diffing. 
    // Here we assume Cloud is source of truth if connected.
    if (cloudData.length > 0) {
        saveLocal(localKey, cloudData);
        notify(); // Tell React components to re-render
    }
  }, (error) => {
      console.warn(`Sync warning for ${collectionName}:`, error.message);
  });
  
  unsubscribeFunctions.push(unsub);
};

const pushToCloud = async (collectionName: string, item: any) => {
  if (!db) return;
  try {
    // Local -> Cloud
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

  // Initialization / Seeding
  checkAndSeedData: () => {
    const isInit = localStorage.getItem(KEYS.INIT);
    
    // Initialize Firebase automatically on load
    initFirebase();

    if (!isInit) {
      // Seed Clients
      const mockClients: Client[] = [
        { id: '1', commercialName: 'Restaurante El Puerto', legalName: 'Gastronomía del Mar S.L.', cif: 'B12345678', address: 'Av. Marítima 45, Valencia', email: 'info@elpuerto.com', phone: '960123456', paymentMethod: 'Transferencia' },
        { id: '2', commercialName: 'Modas Paqui', legalName: 'Francisca García', cif: '12345678Z', address: 'C/ Mayor 12, Madrid', email: 'paqui@modas.com', phone: '600111222', paymentMethod: 'Contado' },
      ];
      saveLocal(KEYS.CLIENTS, mockClients);
      saveLocal(KEYS.PRODUCTS, [
        { id: '1', reference: 'HW-001', description: 'TPV Táctil 15" Capacitivo', price: 850.00, image: '' },
        { id: '2', reference: 'SW-001', description: 'Licencia Software TPV', price: 450.00, image: '' },
      ]);
      saveLocal(KEYS.COMPANY, {
        name: 'Mi Empresa Digital S.L.', cif: 'B00000000', address: 'Calle Innovación 1, Madrid', email: 'contacto@miempresa.com', phone: '910 000 000', terms: ''
      });
      localStorage.setItem(KEYS.INIT, 'true');
    }
  },

  // Connection Diagnostic Tool
  testConnection: async (): Promise<{success: boolean, message: string}> => {
      if (!db) return { success: false, message: "Firebase no está inicializado. Activa la sincronización." };
      
      try {
          // Try to write a tiny dummy file to check permissions
          const testRef = doc(db, '_connection_test', 'test');
          await setDoc(testRef, { timestamp: new Date().toISOString() });
          await deleteDoc(testRef); // Cleanup
          return { success: true, message: "Conexión exitosa. Base de datos operativa." };
      } catch (e: any) {
          console.error(e);
          if (e.code === 'permission-denied') {
              return { success: false, message: "Error de Permisos: Ve a Firebase Console > Firestore > Reglas y asegúrate de que estás en 'Test Mode' o permite lectura/escritura." };
          }
          if (e.code === 'unavailable') {
              return { success: false, message: "Error de Red: No se puede contactar con Firebase. Revisa tu conexión a internet." };
          }
          if (e.code === 'not-found' || e.message.includes('Project')) {
               return { success: false, message: "Base de datos no encontrada. Ve a Firebase Console > Firestore Database y pulsa 'Crear base de datos'." };
          }
          return { success: false, message: `Error desconocido: ${e.message}` };
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
    pushToCloud('budgets', budget); // Sync
    notify();
  },

  deleteBudget: (id: string) => {
    const filtered = storageService.getBudgets().filter(b => b.id !== id);
    saveLocal(KEYS.BUDGETS, filtered);
    deleteFromCloud('budgets', id); // Sync
    notify();
  },

  getNextBudgetNumber: (): string => {
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

  // Configs (Local Only for now to avoid complexity)
  getCompanyProfile: () => loadLocal<CompanyProfile>(KEYS.COMPANY, { name: '', cif: '', address: '', email: '', phone: '', terms: '' }),
  saveCompanyProfile: (profile: CompanyProfile) => saveLocal(KEYS.COMPANY, profile),

  getPdfConfig: () => loadLocal<PdfConfig>(KEYS.PDF_CONFIG, {
    primaryColor: '#dc2626', secondaryColor: '#f8fafc', headingFont: 'helvetica', bodyFont: 'helvetica',
    showLogo: true, showCompanyDetails: true, showImages: true, showLegal: true, showSignatures: true, showPageNumbers: true, showQr: false,
    titleText: 'PRESUPUESTO', footerText: 'Gracias por su confianza.',
    legalTextIds: ['tax', 'payment'], customLegalTexts: [], partnerLogos: {}
  }),
  savePdfConfig: (config: PdfConfig) => saveLocal(KEYS.PDF_CONFIG, config),
  
  getCloudConfig: () => loadLocal<CloudConfig>(KEYS.CLOUD_CONFIG, DEFAULT_CLOUD_CONFIG),
  
  saveCloudConfig: (config: CloudConfig) => {
      saveLocal(KEYS.CLOUD_CONFIG, config);
      initFirebase(); // Re-init with new config
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
