# TourOps - Supplier Management System

## Overview

TourOps is a browser-based internal application designed for tour operators to manage supplier relationships, rates, and tour bookings. The system focuses on tracking FIT (≤8 pax) and Group (>8 pax) tours, managing supplier contacts and rates, and generating booking confirmations and vouchers. As a single-user application, it prioritizes speed of data entry, efficient search capabilities, and document generation while maintaining Excel integration for detailed cost calculations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui for consistent, accessible interface components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Navigation**: Wouter for lightweight client-side routing without heavy router dependencies
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Design**: RESTful endpoints following resource-based URL patterns
- **Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Error Handling**: Centralized error handling middleware with structured error responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL with the following core entities:
  - Suppliers: Contact information, regions, service types, and rate sheet storage
  - Rates: Seasonal pricing with validity periods, room types, and board basis
  - Tours: Client projects with quote references, dates, and status tracking
  - Bookings: Service reservations linked to tours and suppliers
  - Guides: Guide information and assignments
- **File Storage**: Rate sheet PDFs and Excel quotes stored via URL references
- **Migration Management**: Drizzle Kit for database schema migrations and version control

### Authentication and Authorization
- **Security Model**: No authentication required as specified for single-user internal application
- **Session Management**: Stateless application design with no user session requirements
- **Access Control**: Full read/write access for the single user with no role-based restrictions

### External Dependencies
- **Database Provider**: Neon serverless PostgreSQL for cloud-hosted database
- **Email Service**: SendGrid integration for supplier booking emails and client communications
- **File Handling**: PDF and Excel file upload capabilities for rate sheets and quotes
- **Development Tools**: ESBuild for production bundling, TSX for development server
- **UI Components**: Comprehensive Radix UI component library for accessibility compliance

### Architecture Benefits
- **Type Safety**: End-to-end TypeScript ensures data consistency across frontend, backend, and database
- **Performance**: Server-side state caching with React Query minimizes unnecessary API calls
- **Scalability**: Modular component architecture allows for easy feature additions
- **Maintainability**: Shared validation schemas reduce code duplication and ensure consistency
- **Developer Experience**: Hot reload development with comprehensive error handling and logging

### Design Patterns
- **Repository Pattern**: Database storage abstraction layer for easy testing and potential provider switching
- **Component Composition**: Reusable UI components with props-based customization
- **Schema-First Design**: Database schema drives both API contracts and frontend types
- **Error Boundaries**: Graceful error handling with user-friendly error messages