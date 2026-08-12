'use client';
import { AuthProvider } from './AuthProvider';
import { FinanceProvider } from './FinanceProvider';
export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><FinanceProvider>{children}</FinanceProvider></AuthProvider>;
}
