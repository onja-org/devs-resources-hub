import { AuthProvider } from '@/contexts/AuthContext';
import ResourceList from '@/components/ResourceList';
import Header from '@/components/Header';

export default function Home() {
  return (
    <AuthProvider>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Developer Resources
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Curated collection of resources for developers
            </p>
          </div>

          <ResourceList />
        </main>
      </div>
    </AuthProvider>
  );
}
