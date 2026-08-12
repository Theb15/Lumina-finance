import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = { title: 'Lumina — AI Financial Planner', description: 'A premium personal finance planning workspace.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning><Providers>{children}</Providers></body></html>;
}
