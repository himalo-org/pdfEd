import './globals.css';
import './premium.css';
import './workspace.css';
export const metadata = { title: 'Lokoon PDF — your documents, your device', description: 'A private, browser-based PDF workspace', manifest: '/manifest.webmanifest' };
export default function Layout({children}: {children: React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
