# HomeFind

A modern real estate listing platform built with Next.js 15, TypeScript, and Supabase. Features an advanced filtering system with dynamic attributes for flexible property listings.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- Supabase account (for database)

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd HomeFind
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: The application includes fallback values for development, but you should set up your own Supabase instance for production use.

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
HomeFind/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout with providers
│   ├── globals.css        # Global styles (Tailwind CSS)
│   ├── listings/          # Listings page route
│   └── filters/           # Filter demonstration page
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── filters/          # Custom filter components
│   └── listing-item.tsx  # Listing display component
├── lib/                  # Utilities and data logic
│   ├── supabase.ts      # Supabase client configuration
│   ├── database.types.ts # TypeScript database types
│   ├── listings.ts      # Listing data fetching
│   ├── attributes.ts    # Attribute management
│   └── utils.ts         # Utility functions
├── public/              # Static assets
└── ...config files      # Various configuration files
```

## 🛠️ Technology Stack

- **Framework**: [Next.js 15.3.2](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict mode
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Development**: Turbopack for fast builds

## 🎯 Key Features

### Dynamic Attribute System
The platform uses an Entity-Attribute-Value (EAV) pattern for flexible property attributes:
- Support for multiple data types (NUMBER, VARCHAR, DATE, BOOLEAN, ENUM)
- Dynamic filtering based on attribute types
- Extensible without schema changes

### Advanced Filtering
- Context-based state management for filters
- Mobile-responsive filter dialog
- Multiple filter types:
  - Numeric ranges with min/max
  - Text search
  - Boolean toggles
  - Enum selections
  - Date ranges

### Database Schema
- `listings` - Main property listings
- `attributes` - Dynamic attribute definitions
- `listing_attribute_values` - EAV storage for listing attributes
- `enums` & `enum_values` - Support for enumerated attributes

## 📚 Best Practices

### Code Style
- Follow TypeScript strict mode guidelines
- Use existing component patterns from `/components/ui/`
- Maintain consistent naming conventions (kebab-case for files, PascalCase for components)
- Leverage existing utilities in `/lib/utils.ts`

### Component Development
1. Check existing components before creating new ones
2. Use shadcn/ui components as base building blocks
3. Keep components small and focused
4. Use TypeScript interfaces for props

### State Management
- Use React Context for filter state management (see `/components/filters/context.tsx`)
- Keep server components where possible
- Use client components only when necessary for interactivity

### Database Queries
- Utilize the typed Supabase client from `/lib/supabase.ts`
- Follow existing patterns in `/lib/listings.ts` and `/lib/attributes.ts`
- Handle loading and error states appropriately

### Performance Optimization
- Images are optimized automatically via Next.js Image component
- Use dynamic imports for large components
- Leverage Next.js caching strategies

## 🧪 Development Workflow

### Linting
```bash
npm run lint
```

### Type Checking
The project uses TypeScript with strict mode. Type errors are currently bypassed in the build process for rapid development, but should be addressed before production deployment.

### Adding New Features
1. Create feature branch from `master`
2. Implement feature following existing patterns
3. Test thoroughly in development
4. Ensure no TypeScript errors
5. Submit pull request

## 🚨 Important Notes

- **Environment Variables**: Never commit `.env.local` or expose API keys
- **Supabase Fallback**: Remove hardcoded fallback values in `/lib/supabase.ts` before production deployment
- **Build Errors**: ESLint and TypeScript errors are currently ignored in build - fix these before production

## 📝 Contributing

1. Follow the existing code style and patterns
2. Write clean, self-documenting code
3. Test your changes thoroughly
4. Update this README if you add new features or change the structure

## 🔗 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)