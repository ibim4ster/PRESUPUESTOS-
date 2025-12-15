
export type SystemType = 'agora' | 'sage' | 'sage200' | 'sagedespachos';

export type UserRole = 'admin' | 'commercial';
export type AppTheme = 'classic' | 'ocean' | 'midnight'; // New Theme Type

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
  themePreference?: AppTheme; // New
  monthlyGoal?: number; // New: Gamification
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string; 
  details: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO Date
  completed: boolean;
  priority: 'low' | 'normal' | 'high';
  assignedTo: string; // User ID
  relatedClientId?: string;
  relatedBudgetId?: string;
  relatedBudgetNumber?: string;
}

// NEW: Expense Tracking
export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: 'office' | 'travel' | 'software' | 'marketing' | 'salary' | 'other';
    reference?: string; // Invoice number
    recurring: boolean;
}

// NEW: Email Templates
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string; // Supports simple variables like {{client}}, {{number}}
}

export interface Product {
  id: string;
  reference: string;
  description: string;
  price: number;
  costPrice?: number; 
  category?: string; // New: Product Categorization
  stock?: number; // NEW: Inventory
  minStock?: number; // NEW: Inventory Alert Level
  image?: string; 
  system: SystemType | 'both'; 
  isRecurring?: boolean; 
  frequency?: 'monthly' | 'yearly';
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
  notes?: string; 
}

export interface LineItem {
  id: string;
  type: 'product' | 'section'; 
  productId?: string;
  reference: string; 
  description: string; 
  units: number; 
  price: number; 
  costPrice?: number; // Added for Profitability Analysis
  discount?: number; 
  image?: string;
  isRecurring?: boolean; 
}

export interface BudgetEvent {
    id: string;
    timestamp: string;
    authorName: string;
    text: string;
    type: 'note' | 'status_change' | 'creation';
}

export interface PaymentTerm {
    id: string;
    concept: string; // e.g., "A la firma", "A la entrega"
    percentage: number;
    amount: number;
    date?: string;
}

export interface Budget {
  id: string;
  number: string; 
  createdAt: string; 
  updatedAt: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string; // NEW: Why was it rejected?
  
  clientId: string;
  clientData: Client; 
  validityDays: number;
  
  system: SystemType; 
  
  createdBy?: string; 
  creatorName?: string; 

  // NEW: Introduction text for PDF
  presentationText?: string;

  lineItems: LineItem[];
  
  discountPercentage: number;
  bonusAmount: number; 
  taxPercentage: number;
  withholdingTax?: number; 
  
  // New Payment Features
  paymentTerms?: PaymentTerm[];

  clientSignature?: string; 
  internalNotes?: string; 
  events?: BudgetEvent[]; 
  
  parentBudgetId?: string;
  version?: number;
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

export interface CustomLegalText {
  id: string;
  text: string;
  active: boolean;
}

export interface PdfSystemConfig {
  primaryColor: string; 
  secondaryColor: string; 
  
  // Toggles
  showCoverPage: boolean; 
  showLogo: boolean;
  showCompanyDetails: boolean;
  showImages: boolean;
  showLegal: boolean;
  showSignatures: boolean;
  showPageNumbers: boolean;
  showQr: boolean;

  // Custom Texts
  coverTitle?: string; 
  coverSubtitle?: string; 
  titleText: string; 
  footerText: string;
  
  legalTextIds: string[]; 
  customLegalTexts: CustomLegalText[]; 

  partnerLogos: {
    slot1?: string; 
    slot2?: string; 
    slot3?: string; 
  };
}

export interface PdfConfig {
  agora: PdfSystemConfig;
  sage: PdfSystemConfig; 
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
