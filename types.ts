
export type SystemType = 'agora' | 'sage' | 'sage200' | 'sagedespachos';

export interface Product {
  id: string;
  reference: string;
  description: string;
  price: number;
  image?: string; // Base64
  system: SystemType | 'both'; // 'both' is kept for backward compatibility, though specific assignment is preferred
}

export interface ProductKitItem {
  productId: string;
  units: number;
}

export interface ProductKit {
  id: string;
  reference: string; // Kit Name
  description: string;
  items: ProductKitItem[];
  system: SystemType | 'both';
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
  
  system: SystemType; 

  lineItems: LineItem[];
  
  // Financials
  discountPercentage: number;
  bonusAmount: number; // Subvención (fixed amount)
  taxPercentage: number;
  
  clientSignature?: string; // Base64 image
  internalNotes?: string; // Notes not visible to client
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

// New Structure: Separate configs per system
export interface PdfSystemConfig {
  primaryColor: string; 
  secondaryColor: string; 
  
  // Toggles
  showLogo: boolean;
  showCompanyDetails: boolean;
  showImages: boolean;
  showLegal: boolean;
  showSignatures: boolean;
  showPageNumbers: boolean;
  showQr: boolean;

  // Custom Texts
  titleText: string; 
  footerText: string;
  
  legalTextIds: string[]; 
  customLegalTexts: CustomLegalText[]; 

  partnerLogos: {
    slot1?: string; // Agora: Agora / Sage: Partner 1
    slot2?: string; // Agora: Concord / Sage: Partner 2
    slot3?: string; // Agora: Cashlogy / Sage: Partner 3
  };
}

export interface PdfConfig {
  agora: PdfSystemConfig;
  sage: PdfSystemConfig; // Sage 50
  sage200: PdfSystemConfig;
  sagedespachos: PdfSystemConfig;
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