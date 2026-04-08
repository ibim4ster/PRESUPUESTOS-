# PRESUPUESTOS- - Sistema de Gestión de Presupuestos Multi-ERP

Una aplicación web moderna para la creación y gestión de presupuestos comerciales con soporte para múltiples sistemas ERP (Ágora y Sage).

## 🚀 Características Principales

### Gestión de Presupuestos
- Creación y edición de presupuestos con cálculo automático de totales, IVA e IRPF
- Generación de PDFs personalizados por sistema ERP
- Seguimiento de estados (pendiente, aceptado, rechazado)
- Gestión de plazos de pago y vencimientos

### Multi-ERP
- Soporte para Ágora, Sage 50, Sage 200 y Sage Despachos
- Configuración visual independiente para cada sistema
- Filtrado de productos por sistema

### Gestión de Clientes y Productos
- Base de datos de clientes con historial de presupuestos
- Catálogo de productos y kits/packs
- Control de gastos para cálculo de rentabilidad

### IA Integrada
- Generación asistida de textos comerciales con IA
- Mejora de descripciones de productos

## 🏗️ Arquitectura

### Patrón Local-First con Sincronización
La aplicación utiliza un patrón "Dual-Write" donde los datos se guardan inmediatamente en localStorage para respuesta instantánea y luego se sincronizan con Firebase Firestore.

### Estructura de Componentes
- **BudgetEditor**: Editor principal de presupuestos
- **ClientManager**: Gestión de clientes y su historial
- **ProductManager**: Catálogo de productos
- **PdfCustomizer**: Personalización de PDFs por sistema
- **Settings**: Configuración global de la aplicación

## 📦 Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar Firebase (opcional para modo local):
   - Crear proyecto en Firebase Console
   - Configurar credenciales en Settings

4. Iniciar aplicación:
```bash
npm start
```

## 🔧 Configuración

### Configuración de Empresa
- Datos fiscales (CIF, dirección, etc.)
- Logo y preferencias visuales

### Personalización de PDFs
- Colores y branding por sistema ERP
- Cláusulas legales personalizadas
- Logos de partners en footer

## 🌐 Idioma

La aplicación utiliza terminología en español para alinearse con los sistemas ERP objetivo:
- **Presupuesto**: Budget/Quote
- **Cliente**: Client/Customer  
- **Producto**: Product
- **Gasto**: Expense
- **Tarea**: Task

## 🔐 Seguridad

- Sistema de autenticación con rotación de contraseñas cada 15 días
- Almacenamiento seguro de hashes de contraseñas
- Sesiones gestionadas en sessionStorage

## 📊 Flujo de Trabajo

1. **Configuración Inicial**: Datos de empresa y sistemas ERP
2. **Gestión de Catálogo**: Carga de productos y clientes
3. **Creación de Presupuestos**: Uso del editor con asistencia de IA
4. **Generación de PDF**: Exportación con branding personalizado
5. **Seguimiento**: Control de estados y plazos de pago

## 🛠️ Tecnologías

- React con TypeScript
- Firebase Firestore (sincronización)
- jsPDF (generación de PDFs)
- Tailwind CSS (estilos)
- IA para generación de texto

---

## Notes

Este README está basado en la estructura y funcionalidades observadas en el código base. La aplicación está diseñada específicamente para el mercado español con integración con sistemas ERP locales como Ágora y Sage. El patrón local-first asegura funcionamiento offline con sincronización cuando hay conexión.

Wiki pages you might want to explore:
- [UI Components (ibim4ster/PRESUPUESTOS-)](/wiki/ibim4ster/PRESUPUESTOS-#4)
- [Client & Product Management (ibim4ster/PRESUPUESTOS-)](/wiki/ibim4ster/PRESUPUESTOS-#4.4)
- [Multi-System (ERP) Integration (ibim4ster/PRESUPUESTOS-)](/wiki/ibim4ster/PRESUPUESTOS-#6)
