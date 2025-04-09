/**
 * Page de connexion
 * Permet à l'utilisateur de se connecter à l'application
 * Située dans un groupe de routes (auth) pour faciliter le partage de layout
 * @module app/(auth)/login/page
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LoginCredentials } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui';
import { AlertCircle, Check } from 'lucide-react';

/**
 * Page Login
 * Formulaire de connexion à l'application
 * @returns Page Login
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading, error } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  
  // Gérer les requêtes de formulaire avec react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Vérifier si l'utilisateur s'est inscrit avec succès
  useEffect(() => {
    const registered = searchParams?.get('registered');
    if (registered === 'true') {
      setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    }
  }, [searchParams]);
  
  // Rediriger vers le tableau de bord si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);
  
  // Gérer la soumission du formulaire
  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
      // La redirection sera gérée par l'effet useEffect ci-dessus
    } catch (err) {
      console.error('Erreur de connexion:', err);
    }
  };
  
  // Ne rien afficher pendant le chargement initial
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">DeadlineManager</h1>
          <p className="mt-2 text-slate-600">Application de gestion d'échéances</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder à votre tableau de bord
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error.message || 'Erreur de connexion. Veuillez réessayer.'}
              </div>
            )}
            
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email', { 
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide',
                  },
                })}
              />
              
              <Input
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password', { 
                  required: 'Le mot de passe est requis',
                })}
              />
              
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                isLoading={isSubmitting}
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="justify-center">
            <p className="text-sm text-slate-600">
              Pas encore de compte ? Contactez votre administrateur.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}