import { AuthProvider } from '@/contexts/AuthContext';
import SubmitResourceForm from '@/components/SubmitResourceForm';
import Header from '@/components/Header';

export default function SubmitPage() {
  return (
    <AuthProvider>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <SubmitResourceForm />
        </main>
      </div>
    </AuthProvider>
  );
}
