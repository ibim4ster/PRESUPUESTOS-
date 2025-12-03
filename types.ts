
export interface Product {
  id: string;
  reference: string;
  description: string;
  price: number;
  image?: string; // Base64
}

export interface Client {
  id: string;
  commercialName: string;
  legalName: string; // Razón Social
  cif: string;
  address: string;
  email: string;
  phone: string;
  paymentMethod: string;
}

export interface LineItem {
  id: string;
  type: 'product' | 'section'; 
  productId?: string;
  reference: string; // Empty if section
  description: string; // Title if section
  units: number; // 0 if section
  price: number; // 0 if section
  image?: string;
}

export interface Budget {
  id: string;
  number: string; // Sequential ID
  createdAt: string; // ISO Date
  updatedAt: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected';
  clientId: string;
  clientData: Client; // Snapshot of client data at time of creation
  validityDays: number;
  
  lineItems: LineItem[];
  
  // Financials
  discountPercentage: number;
  bonusAmount: number; // Subvención (fixed amount)
  taxPercentage: number;
  
  clientSignature?: string; // Base64 image
}

export interface CompanyProfile {
  name: string;
  cif: string;
  address: string;
  email: string;
  phone: string;
  logo?: string; // Base64
  terms: string; // Default terms
}

export interface CustomLegalText {
  id: string;
  text: string;
  active: boolean;
}

export interface PdfConfig {
  primaryColor: string; // Main Brand Color
  secondaryColor: string; // Header Backgrounds
  headingFont: string;
  bodyFont: string;
  
  // Toggles
  showLogo: boolean;
  showCompanyDetails: boolean;
  showImages: boolean;
  showLegal: boolean;
  showSignatures: boolean;
  showPageNumbers: boolean;
  showQr: boolean;

  // Custom Texts
  titleText: string; // "PRESUPUESTO"
  footerText: string;
  
  legalTextIds: string[]; // IDs from DEFAULT_LEGAL_TEXTS
  customLegalTexts: CustomLegalText[]; // New user defined texts

  partnerLogos: {
    agora?: string;
    concord?: string;
    cashloogy?: string;
  };
}

export interface CloudConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  enabled: boolean;
}

export const DEFAULT_LEGAL_TEXTS = [
  { id: 'tax', text: 'Impuestos indirectos no incluidos.' },
  { id: 'connectivity', text: 'El cliente debe disponer de conexión a internet para soporte remoto.' },
  { id: 'kit_digital', text: 'Solución financiada por el Programa KIT Digital. Si no se recibe la subvención, el cliente abonará el total.' },
  { id: 'data_migration', text: 'El traspaso de datos no está incluido salvo especificación contraria.' },
  { id: 'payment', text: 'Forma de pago según lo estipulado en la ficha de cliente.' },
];