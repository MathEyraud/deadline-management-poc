/**
 * Layout racine de l'application
 * Structure de base commune à toutes les pages
 * @module app/layout
 */
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

// Chargement de la police Inter
const inter = Inter({ subsets: ["latin"] });

// Métadonnées de l'application
export const metadata: Metadata = {
  title: "DeadlineManager - Gestion d'échéances",
  description: "Application de gestion d'échéances pour le secteur de la défense",
};

/**
 * Layout racine qui englobe toute l'application
 * @param props - Propriétés du composant
 * @returns Layout racine
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