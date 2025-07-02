import { Poppins, Space_Grotesk } from 'next/font/google';
import './globals.css';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-space-grotesk' });

export const metadata = { title: 'Cipta Ajar - Next.js Edition' };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${poppins.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
