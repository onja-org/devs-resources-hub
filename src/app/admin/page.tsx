import { AuthProvider } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import Header from '@/components/Header';

export default function AdminPage() {
  return (
    <AuthProvider>
      <Header />
      <AdminDashboard />
    </AuthProvider>
  );
}
