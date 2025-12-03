
import { Budget, Client, CompanyProfile, PdfConfig, Product } from '../types';

const KEYS = {
  BUDGETS: 'proquote_budgets',
  CLIENTS: 'proquote_clients',
  PRODUCTS: 'proquote_products',
  COMPANY: 'proquote_company',
  PDF_CONFIG: 'proquote_pdf_config',
  INIT: 'proquote_initialized_v2'
};

// Generic helper
const save = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to ${key}`, e);
    alert("Storage limit reached. Try deleting old data or smaller images.");
  }
};

const load = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const storageService = {
  // Initialization / Seeding
  checkAndSeedData: () => {
    const isInit = localStorage.getItem(KEYS.INIT);
    if (!isInit) {
      // Seed Clients
      const mockClients: Client[] = [
        { id: '1', commercialName: 'Restaurante El Puerto', legalName: 'Gastronomía del Mar S.L.', cif: 'B12345678', address: 'Av. Marítima 45, Valencia', email: 'info@elpuerto.com', phone: '960123456', paymentMethod: 'Transferencia' },
        { id: '2', commercialName: 'Modas Paqui', legalName: 'Francisca García', cif: '12345678Z', address: 'C/ Mayor 12, Madrid', email: 'paqui@modas.com', phone: '600111222', paymentMethod: 'Contado' },
        { id: '3', commercialName: 'Tech Solutions', legalName: 'Tech Soluciones Informáticas S.A.', cif: 'A98765432', address: 'Parque Tecnológico Edif 2, Málaga', email: 'compras@techsol.com', phone: '952000000', paymentMethod: 'Domiciliación' },
      ];
      save(KEYS.CLIENTS, mockClients);

      // Seed Products
      const mockProducts: Product[] = [
        { id: '1', reference: 'HW-001', description: 'TPV Táctil 15" Capacitivo - Intel i5', price: 850.00, image: '' },
        { id: '2', reference: 'SW-001', description: 'Licencia Software TPV (Pago Único)', price: 450.00, image: '' },
        { id: '3', reference: 'SERV-001', description: 'Instalación y Configuración In-Situ', price: 250.00, image: '' },
        { id: '4', reference: 'PER-001', description: 'Impresora Térmica 80mm Corte Automático', price: 180.00, image: '' },
        { id: '5', reference: 'PER-002', description: 'Cajón Portamonedas 41x41 Automático', price: 65.00, image: '' },
        { id: '6', reference: 'MANT-001', description: 'Mantenimiento Anual Soporte 24/7', price: 300.00, image: '' },
      ];
      save(KEYS.PRODUCTS, mockProducts);

      // Seed Company
      const mockCompany: CompanyProfile = {
        name: 'Mi Empresa Digital S.L.',
        cif: 'B00000000',
        address: 'Calle Innovación 1, 28000 Madrid',
        email: 'contacto@miempresa.com',
        phone: '910 000 000',
        terms: 'Presupuesto válido por 15 días. Garantía de 2 años en hardware.'
      };
      save(KEYS.COMPANY, mockCompany);

      localStorage.setItem(KEYS.INIT, 'true');
    }
  },

  // Budgets
  getBudgets: () => load<Budget[]>(KEYS.BUDGETS, []),
  
  saveBudget: (budget: Budget) => {
    const budgets = storageService.getBudgets();
    const index = budgets.findIndex(b => b.id === budget.id);
    if (index >= 0) {
      budgets[index] = budget;
    } else {
      budgets.push(budget);
    }
    save(KEYS.BUDGETS, budgets);
  },

  deleteBudget: (id: string) => {
    const current = storageService.getBudgets();
    const filtered = current.filter(b => b.id !== id);
    save(KEYS.BUDGETS, filtered);
  },

  getNextBudgetNumber: (): string => {
    const budgets = storageService.getBudgets();
    const year = new Date().getFullYear();
    const prefix = `PRE-${year}-`;
    
    // Find numbers matching current year pattern
    const numbers = budgets
      .map(b => b.number)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.split('-')[2] || '0'));
      
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    const next = max + 1;
    
    return `${prefix}${next.toString().padStart(3, '0')}`;
  },

  // Clients
  getClients: () => load<Client[]>(KEYS.CLIENTS, []),
  saveClient: (client: Client) => {
    const clients = storageService.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = client;
    } else {
      clients.push(client);
    }
    save(KEYS.CLIENTS, clients);
  },
  deleteClient: (id: string) => {
    save(KEYS.CLIENTS, storageService.getClients().filter(c => c.id !== id));
  },

  // Products
  getProducts: () => load<Product[]>(KEYS.PRODUCTS, []),
  saveProduct: (product: Product) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    save(KEYS.PRODUCTS, products);
  },
  deleteProduct: (id: string) => {
    save(KEYS.PRODUCTS, storageService.getProducts().filter(p => p.id !== id));
  },

  // Settings
  getCompanyProfile: () => load<CompanyProfile>(KEYS.COMPANY, {
    name: '', cif: '', address: '', email: '', phone: '', terms: ''
  }),
  saveCompanyProfile: (profile: CompanyProfile) => save(KEYS.COMPANY, profile),

  getPdfConfig: () => load<PdfConfig>(KEYS.PDF_CONFIG, {
    primaryColor: '#dc2626', // Red-600
    secondaryColor: '#f8fafc', // Slate-50
    headingFont: 'helvetica',
    bodyFont: 'helvetica',
    
    showLogo: true,
    showCompanyDetails: true,
    showImages: true,
    showLegal: true,
    showSignatures: true,
    showPageNumbers: true,
    showQr: false,

    titleText: 'PRESUPUESTO',
    footerText: 'Gracias por su confianza.',

    legalTextIds: ['tax', 'payment'],
    customLegalTexts: [],
    partnerLogos: {}
  }),
  savePdfConfig: (config: PdfConfig) => save(KEYS.PDF_CONFIG, config),
  
  // Backup
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
      if(data.budgets) save(KEYS.BUDGETS, data.budgets);
      if(data.clients) save(KEYS.CLIENTS, data.clients);
      if(data.products) save(KEYS.PRODUCTS, data.products);
      if(data.company) save(KEYS.COMPANY, data.company);
      if(data.pdfConfig) save(KEYS.PDF_CONFIG, data.pdfConfig);
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }
};
