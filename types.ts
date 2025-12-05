

export type SystemType = 'agora' | 'sage' | 'sage200' | 'sagedespachos';

export type UserRole = 'admin' | 'commercial';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface Product {
  id: string;
  reference: string;
  description: string;
  price: number;
  image?: string; 
  system: SystemType | 'both'; 
}

export interface ProductKitItem {
  productId: string;
  units: number;
}

export interface ProductKit {
  id: string;
  reference: string;
  description: string;
  items: ProductKitItem[];
  system: SystemType | 'both';
}

export interface Client {
  id: string;
  commercialName: string;
  legalName: string;
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
  reference: string;
  description: string;
  units: number;
  price: number;
  image?: string;
}

export interface Budget {
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected';
  clientId: string;
  clientData: Client;
  validityDays: number;
  
  system: SystemType; 
  
  // Attribution
  createdBy?: string;
  creatorName?: string;

  lineItems: LineItem[];
  
  // Financials
  discountPercentage: number;
  bonusAmount: number;
  taxPercentage: number;
  
  clientSignature?: string; 
  internalNotes?: string; 
}

export interface CompanyProfile {
  name: string;
  cif: string;
  address: string;
  email: string;
  phone: string;
  logo?: string; 
  terms: string; 
}

// --- NEW PDF TEMPLATE SYSTEM ---

export type PdfFont = 'helvetica' | 'times' | 'courier';
export type PdfLayout = 'modern' | 'classic' | 'minimal';

export interface PdfTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  
  // Style Config
  layout: PdfLayout;
  font: PdfFont;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  
  // Toggles
  showLogo: boolean;
  showCompanyDetails: boolean;
  showClientDetails: boolean;
  showImages: boolean;
  showLegal: boolean;
  showSignatures: boolean;
  showPageNumbers: boolean;
  showQr: boolean;
  
  // Text Content
  titleText: string;
  footerText: string;
  
  // Advanced
  headerHeight: number; // mm
  margins: number; // mm
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
  { id: 'kit_digital', text: 'Solución financiada por el Programa KIT Digital.' },
  { id: 'payment', text: 'Forma de pago según lo estipulado en la ficha de cliente.' },
];

// --- PDF CUSTOMIZER CONFIG ---

export interface CustomLegalText {
  id: string;
  text: string;
  active: boolean;
}

export interface PdfSystemConfig {
  primaryColor: string;
  secondaryColor: string;
  titleText: string;
  showLogo: boolean;
  showCompanyDetails: boolean;
  showImages: boolean;
  showLegal: boolean;
  showSignatures: boolean;
  showPageNumbers: boolean;
  showQr: boolean;
  legalTextIds: string[];
  customLegalTexts: CustomLegalText[];
  footerText: string;
  partnerLogos: {
    slot1?: string;
    slot2?: string;
    slot3?: string;
  };
}

export type PdfConfig = Record<SystemType, PdfSystemConfig>;
