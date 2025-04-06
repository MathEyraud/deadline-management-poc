'use client';

/**
 * Layout pour les pages d'authentification
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu des pages
 * @returns {JSX.Element} Layout d'authentification
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Gestion d'Échéances - Secteur Défense
        </h2>
      </div>
      {children}
    </div>
  );
}