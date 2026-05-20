import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

// Load the fonts and create CSS variables for them
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

// This is great for SEO - it shows up in Google Search results
export const metadata = {
  title: 'Literie DZ | Draps et Parures de Lit Premium en Algérie',
  description: 'Découvrez notre collection de draps en coton percale et satin. Confort ultime, qualité supérieure et livraison sur les 58 wilayas.',
};

export default function RootLayout({ children }) {
  return (
    // 'scroll-smooth' makes the anchor links slide elegantly instead of jumping instantly
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-stone-50 text-slate-900 antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}