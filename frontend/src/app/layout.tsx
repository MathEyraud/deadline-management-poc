import './globals.css';
import { Providers } from './providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Chargement de la police Inter pour toute l'application
const inter = Inter({ subsets: ['latin'] });

/**
 * Métadonnées de l'application
 */
export const metadata: Metadata = {
  title: 'Gestion d\'Échéances - Secteur Défense',
  description: 'Application sécurisée de gestion d\'échéances pour le secteur défense',
};

/**
 * Layout principal de l'application qui enveloppe toutes les pages
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu des pages
 * @returns {JSX.Element} Layout principal
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}