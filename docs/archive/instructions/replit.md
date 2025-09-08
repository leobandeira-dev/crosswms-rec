# replit.md

## Overview

CROSSWMS (Cross Warehouse Management System) is a comprehensive logistics management system designed for Brazilian NFe (Nota Fiscal Eletrônica) processing and complete logistics operations. It aims to streamline logistics processes, provide real-time tracking, and offer a multi-tenant platform for various logistics operators, clients, and suppliers. The system's vision is to eliminate manual processes, reduce operational stress, and enhance client satisfaction through technology, incorporating features like RPA for NFe XML retrieval, load planning, collection scheduling, and gamification.

## User Preferences

Preferred communication style: Simple, everyday language.
Language preference: All feedback and communication must always be in Portuguese (Brazil).

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **UI**: Radix UI components, Tailwind CSS (custom design system with Uni Sans fonts)
- **State Management**: TanStack Query
- **Authentication**: Custom JWT-based
- **Routing**: React Router

### Backend
- **Runtime**: Node.js with Express.js (TypeScript with ES modules)
- **Database ORM**: Drizzle ORM
- **Build**: Vite (development), esbuild (production)

### Database
- **Primary**: PostgreSQL (Neon serverless)
- **Connection**: @neondatabase/serverless (connection pooling)
- **Schema Management**: Drizzle Kit
- **Design**: Modular schema (logistics, core)
- **Multi-tenancy**: 3-level hierarchical system (`grupo_empresarial_id`, `empresa_matriz_id`, `filial_transportador`), with data isolation based on company ownership and user type.

### Key Features
- **NFe Processing**: Automated retrieval, parsing, validation, and data extraction from XML, with fallback mechanisms, batch processing optimization for large volumes (35+ notes per order), and enhanced search system with 11 filter types (número, chave, remetente, destinatário, cidade origem/destino, UF origem/destino, estágio, status, prioridade) supporting both text input and dropdown selection.
- **Logistics**: Load management (volume tracking), automated collection scheduling, vehicle/driver management, document processing, and gamification.
- **Authentication & Authorization**: JWT, role-based access control (39 granular permissions), multi-company support with hierarchical user types (Super Admin, Transportador, Cliente, Fornecedor).
- **UI/UX**: Consistent silver/blue color scheme, responsive grid layouts, card-based designs, intuitive forms, interactive pricing calculator, and a dynamic widget-based dashboard.
- **System Configuration**: Centralized management of company profiles, email settings, and granular permissions.
- **Approval Workflow**: Hierarchical approval system for new user and company registrations.
- **Commercial Presentation**: Integrated interactive presentation tool with real-time pricing and ROI metrics.
- **Print System**: Universal print system with reusable components - UniversalPrintDialog with multiple layout support (OrdemCargaLayout, RomaneioExpedicaoLayout, EtiquetasLayout), barcode generation, and advanced DANFE PDF generation system with two variants: simplified DANFE (DANFESimples) for testing and full SEFAZ-compliant DANFE (DANFESefazOficial) with authentic layout following official Brazilian standards (implemented Aug 2025), featuring proper formatting, multi-column layout, product tables, tax calculations, and modular architecture for different document types.
- **Label ID System**: Dual-structure ID generation system with temporal format: individual volume labels using NOTA-VOLUME-DATA-HORA+MINUTOS format (e.g., 111007-001-11082025-1503) for precise timestamp tracking, and MIX labels (Etiqueta Mãe) using ETQM-{timestamp} format (e.g., ETQM-174960020959) for grouping multiple volumes. Automatic volume creation when ordem de carga is saved, ensuring database persistence. QR code integration with real-time updates. Consistent implementation across frontend and backend (updated Aug 2025).
- **FilaX Module**: Features drag-and-drop for order movement, mobile optimization, immersive TV display mode, multi-order architecture, comprehensive archiving, restored SLA responsibility tracking functionality, and integrated label printing with two access points: individual order-level printing and individual NFe-level printing within order editing. SLA calculation system fully functional with accurate historical performance tracking (fixed August 2025) - correctly identifies all cards that passed through each stage and calculates percentage-based SLA compliance from historical data using new `/api/fila-x/historico` endpoint with proper field mapping between `historicoFilaX` table and frontend requirements.
- **Batch Processing**: Optimized batch processing system for handling large orders with 35+ fiscal notes, featuring error resilience, timeout prevention, and detailed progress logging.
- **Enhanced Search System**: Expanded NFe search from 8 to 11 filter types (August 2025), adding Estágio, Status, and Prioridade filters with dynamic UI - dropdown selection for categorical filters (status, priority, stage) and text input for descriptive fields, with backend optimization to prevent database connection overload.
- **Automated Data Flow**: Complete strategy for automatic feeding of NFe tracking data from cargo orders (documented in MAPEAMENTO_ORDENS_NFE.md), including stage progression based on order dates, status hierarchy (Disponível, Bloqueada, Avariada, Extraviado), priority inheritance, real-time location calculation, automated event history generation, and comprehensive SLA tracking with intelligent notifications based on priority levels.
- **Date Field System**: Comprehensive conditional date field system supporting all 9 operation types (4 Entrada, 5 Saída, 1 Transferência) with intelligent UX showing only relevant fields per operation type. Critical backend fix (August 2025) ensuring all order dates properly feed into notas_fiscais table for accurate tracking, replacing previous null values with actual order date data in processBatchOfNotes function.

## External Dependencies

- **@neondatabase/serverless**: PostgreSQL database connectivity.
- **drizzle-orm**: Type-safe database operations.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/react-***: UI component library.
- **bcrypt**: Password hashing.
- **NSDocs API**: Primary API for NFe XML retrieval.
- **BrasilAPI / ReceitaWS / CNPJ.ws**: For automatic CNPJ data lookup.
- **Cloudflare**: For custom domain management and SSL.