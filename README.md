# 🚀 Next.js CMS Template

A modern Content Management System built with Next.js 15, React 19, and TypeScript, featuring a robust UI component library and internationalization support.

## ✨ Features

- 🎨 Modern UI components with Radix UI
- 📝 Form validation with Zod
- 📱 Responsive design with TailwindCSS
- 🔒 Type-safe development with TypeScript
- ⚡ Efficient data fetching with React Query
- 📤 File upload capabilities with React Dropzone
- 🌐 Internationalization support

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Next.js 15.2.4 |
| Language | TypeScript |
| UI Components | Radix UI, TailwindCSS |
| State Management | React Query, Zustand |
| Form Handling | React Hook Form with Zod validation |
| Internationalization | i18next |
| Styling | TailwindCSS with custom animations |
| API Client | Axios |
| Utilities | Lodash, Dayjs |
| Lint | Biome |

## 📁 Project Structure

```bash
├── src/                 # Source code
│   ├── app/            # Next.js app directory
│   │   ├── [locale]/   # Internationalized routes
│   │   │   ├── (auth)/ # Authentication routes
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   └── (cms)/  # CMS routes
│   │   │       ├── dashboard/
│   │   │       ├── users/
│   │   │       ├── settings/
│   │   │       └── ...
│   │   ├── globals.css # Global styles
│   │   ├── providers.tsx # App providers
│   │   └── favicon.ico # App icon
│   ├── components/     # Reusable UI components
│   ├── modules/        # Page modules
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── libs/           # Third-party library configurations
│   ├── locales/        # Translation files
│   ├── types/          # Data types/interfaces
│   ├── schemas/        # Zod validation schemas
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── constants/      # App constants
│   ├── utils/          # App utils
│   ├── stores/         # Zustand stores
│   ├── i18nConfig.ts   # i18n configuration
│   └── middleware.ts   # Next.js middleware
├── public/             # Static assets
├── .next/             # Next.js build output
├── node_modules/      # Dependencies
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── next.config.ts     # Next.js configuration
├── postcss.config.mjs # PostCSS configuration
└── eslint.config.mjs  # ESLint configuration
└── docker             # Docker configuration
└── docker-compose.yml # Docker compose execution
```

## 📦 Source Code Structure

### `src/app/` 📱
- Contains the main application routes and layouts
- Uses Next.js 13+ App Router
- Supports internationalization with `[locale]` dynamic routing

### `src/app/[locale]/` 🌐
- Handles internationalized routes
- Contains two main route groups:
  - `(auth)/`: Authentication-related routes
    - `login/`: User login page
    - `register/`: User registration page
    - `forgot-password/`: Password recovery page
  - `(cms)/`: CMS management routes
    - `dashboard/`: Main dashboard page
    - `users/`: User management section
    - `settings/`: System settings
    - Other CMS-specific routes

### `src/components/` 🧩
- Reusable UI components
- Follows atomic design principles
- Includes shared components like buttons, forms, modals, etc.

### `src/modules/` 📦
- Page-level components and layouts
- Handles page-specific logic and state management
- Integrates multiple components into complete pages

### `src/contexts/` 🔄
- React context providers
- Manages global application state
- Handles theme, authentication, and other shared states

### `src/hooks/` 🎣
- Custom React hooks
- Reusable logic for components
- Includes hooks for data fetching, form handling, etc.

### `src/libs/` 📚
- Third-party library configurations
- Custom implementations of external libraries
- Integration setups

### `src/locales/` 🌍
- Internationalization files
- Translation strings for different languages
- i18n configuration

### `src/types/` 📊
- TypeScript interfaces and types
- Data models for API responses
- Shared type definitions

### `src/schemas/` 📝
- Zod validation schemas
- Form validation rules
- API request/response validation

### `src/services/` 🔌
- API service functions
- HTTP client configurations
- API endpoint definitions

### `src/utils/` 🛠️
- Helper functions
- Common utilities
- Shared business logic

### `src/constants/` ⚙️
- Application constants
- Configuration values
- Static data

### `src/stores/` ⚡
- Global state management

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- Yarn package manager

### Installation

1. Clone your forked repository:
```bash
git clone https://github.com/mytoandeptrai/nextjs-boilerplate.git
```

2. Install dependencies:
```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build

To create a production build:

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Linting

Run the linter to check for code quality:

```bash
pnpm lint
```

### TypeScript Type Checking

To verify type safety and catch potential type errors in your project, run the TypeScript compiler check:

``` bash
pnpm ts-check
```

### Customization Guide

#### API Configuration
1. Navigate to `src/services/config/axios.ts`
2. Update the `API_URL` constant with your backend endpoint
3. Modify default headers in `defaultHeaders` object as needed
4. Add any custom interceptors for authentication or error handling

#### Logo Integration
1. Place your logo file in `public/images/` directory
2. Supported formats: SVG, PNG, JPG
3. Recommended dimensions: 200x50px for header logos
4. Update logo path in your layout components

#### Theme Customization
1. Open `src/app/globals.css`
2. Locate the `@theme inline` section
3. Update color variables:
   - Primary colors: `--color-primary`, `--color-primary-foreground`
   - Brand colors: `--color-brand-100` through `--color-brand-10`
   - Customize other theme variables as needed

#### Metadata Configuration
1. Edit `src/app/[locale]/(auth)/layout.tsx` or `src/app/[locale]/(cms)/layout.tsx`
2. Update the `metadata` object:
   ```typescript
   export const metadata: Metadata = {
     title: "Your App Name",
     description: "Your app description",
     keywords: ["your", "keywords"],
     authors: [{ name: "Your Name" }],
     openGraph: {
       title: "Your App Name",
       description: "Your app description",
       images: ["/images/og-image.jpg"]
     }
   };
   ```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives/docs/overview/introduction)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
