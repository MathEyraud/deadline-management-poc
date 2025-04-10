/**
 * Layout pour les pages d'authentification
 * Fournit une mise en page commune pour les pages de login et d'enregistrement
 * Utilise un groupe de routes nommé (auth) pour isolation
 * @module app/(auth)/layout
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
          Gestion d'Échéances
        </h2>
      </div>
      {children}
    </div>
  );
}