Aquí tienes un README detallado y profesional para el repositorio:

---

# README propuesto para `PRESUPUESTOS-`

```markdown
<div align="center">

# Gravity Manager

**Aplicación profesional de gestión comercial y presupuestos**

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28)

</div>

---

## Descripcion

Gravity Manager (`proquote-manager`) es una Single Page Application (SPA) diseñada para equipos comerciales.
Permite crear, gestionar y dar seguimiento a presupuestos profesionales, integrándose con
múltiples contextos ERP (Ágora, Sage 50, Sage 200 y Sage Despachos).

Características principales:

- **Local-first con sincronización en la nube** — Los datos se guardan en LocalStorage y se sincronizan
  en tiempo real con Firebase Firestore.
- **Generación de PDF profesional** — PDFs personalizables por sistema ERP con portada, tabla de
  productos, condiciones legales, firmas y logos de partners.
- **IA integrada (Google Gemini)** — Pulido automático de descripciones técnicas, generación de cartas
  de presentación y redacción de emails comerciales.
- **Multi-sistema ERP** — Branding, colores y filtrado de productos diferenciado para cada contexto
  (`agora`, `sage`, `sage200`, `sagedespachos`).
- **PWA-ready** — Configurada como Progressive Web App con soporte para instalación en dispositivos
  móviles.

---

## Stack Tecnológico

| Categoría        | Tecnología                | Uso                                              |
| :--------------- | :------------------------ | :----------------------------------------------- |
| **Framework**    | React 19 + TypeScript 5   | Renderizado de UI y tipado estático               |
| **Estilos**      | Tailwind CSS (CDN)        | Diseño responsive utility-first                   |
| **Animaciones**  | Framer Motion             | Transiciones de vistas y feedback visual          |
| **Persistencia** | Firebase Firestore + LocalStorage | Pipeline de sincronización dual-write     |
| **IA**           | Google Gemini (`@google/genai`) | Generación de texto comercial             |
| **PDF**          | jsPDF + jspdf-autotable   | Generación de documentos en el cliente            |
| **Gráficos**     | Recharts                  | Visualización de datos en el dashboard            |
| **Iconos**       | Lucide React              | Iconografía consistente                           |
| **Build**        | Vite 5                    | Bundling y servidor de desarrollo                 |

---

## Estructura del Proyecto

```
PRESUPUESTOS-/
├── index.html              # Punto de entrada HTML (PWA manifest, Tailwind, importmap)
├── index.tsx               # Bootstrap de React (ReactDOM.createRoot)
├── App.tsx                 # Componente raíz — routing, estado global, notificaciones
├── types.ts                # Modelo de datos completo (Budget, Client, Product, etc.)
├── vite.config.ts          # Configuración de Vite
├── package.json            # Dependencias y scripts
├── components/
│   ├── AdminPanel.tsx      # Panel de administración de usuarios
│   ├── BudgetEditor.tsx    # Editor completo de presupuestos
│   ├── CalendarView.tsx    # Vista de calendario de tareas
│   ├── ClientManager.tsx   # CRUD de clientes
│   ├── CommandPalette.tsx  # Paleta de comandos (Ctrl+K)
│   ├── Dashboard.tsx       # Panel principal con métricas y gráficos
│   ├── EmailTemplates.tsx  # Gestión de plantillas de email
│   ├── ExpenseManager.tsx  # Gestión de gastos
│   ├── Layout.tsx          # Shell de navegación lateral
│   ├── Login.tsx           # Pantalla de autenticación
│   ├── PdfCustomizer.tsx   # Personalización visual de PDFs por sistema
│   ├── ProductManager.tsx  # CRUD de productos y kits
│   ├── SearchableSelect.tsx # Componente de selección con búsqueda
│   └── Settings.tsx        # Configuración general y perfil de empresa
└── services/
    ├── ai.ts               # Integración con Google Gemini (polish, intro, email)
    ├── auth.ts             # Autenticación con SHA-256 y gestión de sesión
    ├── pdfGenerator.ts     # Motor de generación de PDF con jsPDF
    └── storage.ts          # Capa de persistencia LocalStorage + Firebase sync
```

---

## Requisitos Previos

- **Node.js** (v18 o superior recomendado)
- **npm** (incluido con Node.js)
- **Clave API de Google Gemini** (opcional, para funcionalidades de IA)

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/ibim4ster/PRESUPUESTOS-.git
cd PRESUPUESTOS-
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la clave de API de Gemini (opcional)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_clave_api_aqui
```

> Sin esta clave, la app funciona normalmente pero las funciones de IA (pulir descripciones,
> generar cartas de presentación, redactar emails) devolverán el texto original o un fallback.

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

### 5. Build de producción

```bash
npm run build
npm run preview   # Para previsualizar el build
```

Los archivos compilados se generan en el directorio `dist/`.

---

## Credenciales por Defecto

Al iniciar la aplicación por primera vez, se crea automáticamente un usuario administrador:

| Campo      | Valor   |
| :--------- | :------ |
| **Usuario** | `admin` |
| **Contraseña** | `admin` |

> Se recomienda cambiar la contraseña inmediatamente tras el primer inicio de sesión.

---

## Modelo de Datos Principal

El archivo `types.ts` define todas las entidades del sistema:

| Entidad          | Descripción                                                        |
| :--------------- | :----------------------------------------------------------------- |
| `Budget`         | Presupuesto completo con líneas, descuentos, impuestos y firmas    |
| `Client`         | Ficha de cliente (nombre comercial, razón social, CIF, etc.)       |
| `Product`        | Producto del catálogo con precio, coste, stock y sistema ERP       |
| `ProductKit`     | Agrupación de productos como paquete comercial                     |
| `LineItem`       | Línea individual de un presupuesto (producto o sección)            |
| `Expense`        | Registro de gasto con categoría y recurrencia                      |
| `Task`           | Tarea asignable con prioridad y relación a cliente/presupuesto     |
| `User`           | Usuario del sistema con rol (`admin` / `commercial`) y tema visual |
| `EmailTemplate`  | Plantilla de email con variables (`{{client}}`, `{{number}}`)      |
| `CompanyProfile` | Perfil de la empresa emisora (logo, CIF, dirección, etc.)          |
| `PdfConfig`      | Configuración visual del PDF por cada sistema ERP                  |

### Estados de un Presupuesto

Un presupuesto (`Budget`) puede estar en uno de estos estados:

```
draft → pending → accepted
                → rejected (con motivo de rechazo)
```

---

## Servicios (Capa de Lógica)

### `storageService` (`services/storage.ts`)

Capa de persistencia **local-first** con sincronización bidireccional a Firebase:

- **Escritura dual**: cada operación guarda en LocalStorage y luego empuja a Firestore.
- **Listeners en tiempo real**: `onSnapshot` de Firestore actualiza el estado local automáticamente.
- **Seed automático**: al primer inicio, crea el usuario admin por defecto.
- **Export/Import**: permite exportar todos los datos a JSON e importarlos de vuelta.
- **Test de conexión**: método `testConnection()` para verificar la conectividad con Firebase.

### `authService` (`services/auth.ts`)

- Hashing de contraseñas con **SHA-256** vía `crypto.subtle`.
- Sesión almacenada en `sessionStorage` (expira al cerrar la pestaña).
- El hash de la contraseña **no** se almacena en la sesión por seguridad.
- Verificación de rol admin con `isAdmin()`.

### `aiService` (`services/ai.ts`)

Integración con **Google Gemini** (`gemini-3-flash-preview`):

| Método              | Función                                                          |
| :------------------ | :--------------------------------------------------------------- |
| `polishDescription` | Mejora comercialmente una descripción técnica de producto         |
| `generateIntro`     | Genera una carta de presentación personalizada para el cliente    |
| `generateEmail`     | Redacta emails de envío o seguimiento (devuelve subject + body)   |
| `getSalesAdvice`    | Devuelve un consejo motivacional (placeholder actual)             |

### `generateBudgetPdf` (`services/pdfGenerator.ts`)

Genera PDFs profesionales con:

- **Portada** personalizable (título, subtítulo, logo, datos del cliente)
- **Cabecera** con datos del emisor y receptor
- **Texto de presentación** (generado opcionalmente por IA)
- **Tabla de productos** con imágenes, descuentos y secciones
- **Desglose financiero** (subtotal, descuentos, bonos, IVA, IRPF, total)
- **Tabla de vencimientos** de pago
- **Términos y condiciones** legales configurables
- **Zona de firmas** con soporte para firma digital del cliente
- **Logos de partners** en el pie de página
- **Numeración de páginas**

---

## Sistemas ERP Soportados

La aplicación opera bajo un contexto `SystemType` que afecta al branding, colores del PDF y
filtrado de productos:

| Sistema          | Etiqueta                    | Color primario |
| :--------------- | :-------------------------- | :------------- |
| `agora`          | Ágora Restauración/Retail   | `#dc2626` (rojo) |
| `sage`           | Sage 50                     | `#000000` (negro) |
| `sage200`        | Sage 200                    | `#000000` (negro) |
| `sagedespachos`  | Sage Despachos              | `#000000` (negro) |

El cambio de sistema se realiza desde la barra de navegación y dispara una notificación sonora.

---

## Funcionalidades Destacadas

- **Command Palette** — Acceso rápido con `Ctrl+K` / `Cmd+K` para navegar y buscar presupuestos.
- **Notificaciones con sonido** — Feedback auditivo generado con Web Audio API para acciones de
  éxito, error y cambio de sistema.
- **Temas visuales** — Cada usuario puede elegir entre `classic`, `ocean` y `midnight`.
- **Metas mensuales** — Sistema de gamificación con objetivo mensual configurable por usuario.
- **Versionado de presupuestos** — Soporte para `parentBudgetId` y `version` para rastrear
  revisiones.
- **Gestión de inventario** — Stock actual y nivel mínimo de alerta por producto.
- **Productos recurrentes** — Marcado de productos con frecuencia mensual o anual.
- **Registro de actividad** — Log de auditoría con las últimas 200 acciones del sistema.

---

## Scripts Disponibles

| Comando           | Descripción                                |
| :---------------- | :----------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo con Vite  |
| `npm run build`   | Genera el build de producción en `dist/`   |
| `npm run preview` | Previsualiza el build de producción        |

---

## Licencia

Proyecto privado. Consulta con el propietario del repositorio para términos de uso.
```

---

Este README cubre todos los aspectos del repositorio basándome en el código fuente real:

- **Descripción general** del proyecto y sus capacidades [1](#0-0) 
- **Stack tecnológico** completo con cada dependencia [2](#0-1) 
- **Estructura de archivos** con la función de cada componente y servicio [3](#0-2) 
- **Instrucciones de instalación** y ejecución [4](#0-3) 
- **Credenciales por defecto** (admin/admin) creadas en el seed inicial [5](#0-4) 
- **Modelo de datos** con todas las entidades definidas en `types.ts` [6](#0-5) 
- **Servicios**: storage con sync Firebase [7](#0-6) , auth con SHA-256 [8](#0-7) , IA con Gemini [9](#0-8) , y generador de PDF [10](#0-9) 
- **Sistemas ERP** soportados con sus etiquetas y colores [11](#0-10) 
- **Funcionalidades** como Command Palette (`Ctrl+K`) [12](#0-11) , notificaciones sonoras [13](#0-12) , y configuración PWA [14](#0-13)

### Citations

**File:** package.json (L2-6)
```json
{
  "name": "proquote-manager",
  "private": true,
  "version": "2.1.0",
  "type": "module",
```

**File:** package.json (L12-29)
```json
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "firebase": "^10.8.0",
    "recharts": "^2.12.0",
    "framer-motion": "^11.11.17",
    "lucide-react": "^0.460.0",
    "@google/genai": "^1.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
```

**File:** App.tsx (L2-18)
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientManager } from './components/ClientManager';
import { ProductManager } from './components/ProductManager';
import { Settings } from './components/Settings';
import { BudgetEditor } from './components/BudgetEditor';
import { PdfCustomizer } from './components/PdfCustomizer';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { ExpenseManager } from './components/ExpenseManager';
import { CalendarView } from './components/CalendarView';
import { CommandPalette } from './components/CommandPalette';
import { Budget, SystemType, User } from './types';
import { storageService } from './services/storage';
import { authService } from './services/auth';
```

**File:** App.tsx (L59-65)
```typescript
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsCmdOpen(prev => !prev); }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
```

**File:** App.tsx (L67-89)
```typescript
  const playNotificationSound = (type: 'success' | 'error' | 'system' = 'system') => {
      try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();
          const now = ctx.currentTime;
          const gain = ctx.createGain();
          gain.connect(ctx.destination);
          if (type === 'error') {
              const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.1);
              gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
              osc.connect(gain); osc.start(now); osc.stop(now + 0.15);
          } else if (type === 'success') {
              const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now);
              gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.03, now + 0.02); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
              osc.connect(gain); osc.start(now); osc.stop(now + 0.4);
          } else {
              const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(750, now);
              gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.04, now + 0.005); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
              osc.connect(gain); osc.start(now); osc.stop(now + 0.1);
          }
      } catch(e) {}
  };
```

**File:** App.tsx (L117-117)
```typescript
  const systemLabels = { agora: 'Ágora Restauración/Retail', sage: 'Sage 50', sage200: 'Sage 200', sagedespachos: 'Sage Despachos' };
```

**File:** README.md (L11-20)
```markdown
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
```

**File:** services/storage.ts (L126-131)
```typescript
export const storageService = {
  subscribe: (listener: Listener) => { listeners.push(listener); return () => { const idx = listeners.indexOf(listener); if (idx > -1) listeners.splice(idx, 1); }; },
  checkAndSeedData: async () => {
    const initVersion = localStorage.getItem(KEYS.INIT);
    initFirebase();
    if (initVersion !== KEYS.INIT) { localStorage.setItem(KEYS.INIT, KEYS.INIT); }
```

**File:** services/storage.ts (L132-143)
```typescript
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
```

**File:** types.ts (L2-5)
```typescript
export type SystemType = 'agora' | 'sage' | 'sage200' | 'sagedespachos';

export type UserRole = 'admin' | 'commercial';
export type AppTheme = 'classic' | 'ocean' | 'midnight'; // New Theme Type
```

**File:** services/auth.ts (L4-11)
```typescript
export const authService = {
  // Helper to hash password using SHA-256
  hashPassword: async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
```

**File:** services/ai.ts (L4-20)
```typescript
export const aiService = {
    isAvailable: () => !!process.env.API_KEY,

    polishDescription: async (text: string): Promise<string> => {
        if (!process.env.API_KEY) return text;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Mejora comercialmente esta descripción técnica de un producto para un presupuesto profesional. Mantenlo conciso pero atractivo. Texto original: "${text}"`,
            });
            return response.text || text;
        } catch (error) {
            console.error("AI polish error:", error);
            return text;
        }
    },
```

**File:** services/pdfGenerator.ts (L6-11)
```typescript
export const generateBudgetPdf = (
  budget: Budget,
  company: CompanyProfile,
  fullConfig: PdfConfig
) => {
  const doc = new jsPDF();
```

**File:** index.html (L9-15)
```html
    <!-- PWA Settings -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#0f172a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Gravity">
    <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/2910/2910768.png">
```
