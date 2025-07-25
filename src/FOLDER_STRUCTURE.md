# DomusEye - Folder Structure

This document outlines the recommended folder structure for the DomusEye Next.js full-stack application.

## 📁 Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── favicon.ico        # App favicon
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── assets/                # Static assets
│   ├── fonts/            # Custom fonts
│   ├── icons/            # Icon assets
│   └── images/           # Image assets
├── components/            # Reusable components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components (Header, Footer, Sidebar)
│   └── ui/               # UI components (Button, Input, Modal, etc.)
├── config/               # Configuration files
├── constants/            # Application constants
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth/            # Authentication utilities
│   ├── database/        # Database connection and models
│   └── validations/     # Validation schemas (Zod, etc.)
├── middleware/           # Custom middleware
├── services/             # API services and external integrations
├── store/                # State management (Redux, Zustand, etc.)
├── styles/               # Styling files
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 📋 Folder Descriptions

### Core Folders

- **`app/`** - Next.js App Router directory containing pages, layouts, and API routes
- **`components/`** - Reusable React components organized by category
- **`lib/`** - Core utilities and configurations
- **`types/`** - TypeScript type definitions and interfaces

### Feature Folders

- **`assets/`** - Static assets like images, fonts, and icons
- **`config/`** - Application configuration files
- **`constants/`** - Application-wide constants
- **`contexts/`** - React Context providers
- **`hooks/`** - Custom React hooks
- **`middleware/`** - Custom middleware functions
- **`services/`** - API services and external integrations
- **`store/`** - State management setup
- **`styles/`** - Global styles and CSS modules
- **`utils/`** - Utility functions and helpers

### Component Organization

- **`components/ui/`** - Basic UI components (Button, Input, Modal, etc.)
- **`components/forms/`** - Form-specific components
- **`components/layout/`** - Layout components (Header, Footer, Sidebar)

### Library Organization

- **`lib/auth/`** - Authentication setup and utilities
- **`lib/database/`** - Database connection, models, and schemas
- **`lib/validations/`** - Validation schemas using libraries like Zod

## 🚀 Best Practices

1. **Component Organization**: Group components by functionality and reusability
2. **Type Safety**: Use TypeScript types and interfaces consistently
3. **Code Splitting**: Organize code by features and responsibilities
4. **Naming Conventions**: Use clear, descriptive names for files and folders
5. **Barrel Exports**: Use index files to create clean import paths

## 📝 Notes

- Each folder contains a `.gitkeep` file to ensure empty folders are tracked in Git
- This structure follows Next.js 13+ App Router conventions
- The structure is scalable and suitable for both small and large applications
- Consider using absolute imports with path mapping in `tsconfig.json`