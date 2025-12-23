# Next.js Project with Firebase

This is a [Next.js](https://nextjs.org) project with TypeScript, Tailwind CSS, ESLint, Prettier, and Firebase integration.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Firebase** - Backend services
  - Authentication
  - Firestore Database

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created (https://console.firebase.google.com)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure Firebase:

   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase configuration values from your Firebase project settings

```bash
cp .env.local.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── contexts/         # React contexts (AuthContext)
└── lib/              # Utility functions
    ├── firebase.ts   # Firebase initialization
    ├── auth.ts       # Authentication helpers
    └── firestore.ts  # Firestore helpers
```

## Firebase Setup

### Authentication

The project includes ready-to-use authentication functions:

```typescript
import { signUp, signIn, signOut } from '@/lib/auth';

// Sign up
await signUp('email@example.com', 'password');

// Sign in
await signIn('email@example.com', 'password');

// Sign out
await signOut();
```

Use the `AuthProvider` and `useAuth` hook to access the current user:

```tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  // ...
}
```

### Firestore

Use the provided Firestore helpers for database operations:

```typescript
import { addDocument, getDocument, updateDocument, deleteDocument } from '@/lib/firestore';

// Add document
const id = await addDocument('users', { name: 'John Doe' });

// Get document
const user = await getDocument('users', id);

// Update document
await updateDocument('users', id, { name: 'Jane Doe' });

// Delete document
await deleteDocument('users', id);
```

## Environment Variables

Create a `.env.local` file with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# devs-resources-hub
