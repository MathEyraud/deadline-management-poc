import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Next.js pour la protection des routes
 * Redirige les utilisateurs non authentifiés vers la page de connexion
 * et les utilisateurs authentifiés vers la page d'accueil s'ils essaient d'accéder à la page de connexion
 * @param {NextRequest} request - Requête entrante
 * @returns {NextResponse} Réponse Next.js
 */
export function middleware(request: NextRequest) {
  // Récupérer le token d'authentification
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.split('Bearer ')[1] ||
                '';
  
  // Vérifier si la route est protégée (toutes sauf /login)
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isProtectedRoute = !isLoginPage && 
                          !request.nextUrl.pathname.startsWith('/_next') && 
                          !request.nextUrl.pathname.startsWith('/api');
  
  // Si c'est une route protégée et qu'il n'y a pas de token, rediriger vers /login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si c'est la page de login et qu'il y a un token, rediriger vers /
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configurer le middleware pour s'exécuter sur les routes spécifiées
export const config = {
  matcher: [
    /*
     * Correspond à toutes les routes sauf celles qui commencent par:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icône du site)
     * - public (fichiers publics)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};