import type { ReactNode } from 'react';
import './style.css';
export const metadata = { title: 'RS-1 Extraction PoC', description: 'Local rule-based DOCX extraction' };
export default function RootLayout({children}:{children:ReactNode}) {return <html lang="th"><body>{children}</body></html>}
