import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function TopUpRequestsPage() {
  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Fitur Sedang Dalam Perbaikan</AlertTitle>
      <AlertDescription>
        Halaman verifikasi top-up untuk sementara dinonaktifkan untuk mengatasi masalah pengambilan data. Kami akan memperbaikinya segera.
      </AlertDescription>
    </Alert>
  );
}
