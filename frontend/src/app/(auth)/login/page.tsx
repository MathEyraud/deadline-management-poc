/**
 * Page de connexion avec transition fluide vers le dashboard
 * @module app/(auth)/login/page
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LoginCredentials } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { AlertCircle, Check, Loader } from 'lucide-react';

/**
 * Page Login avec transition fluide vers le dashboard
 * @returns Page Login optimisée
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading: authLoading, error } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  // État combiné pour le chargement : inclut la soumission du formulaire et l'attente de redirection
  const [isLoading, setIsLoading] = useState(false);
  
  // Gérer les requêtes de formulaire avec react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
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
    // Important : ne pas désactiver le chargement avant la redirection
    if (isAuthenticated && !authLoading) {
      // Redirection manuelle plutôt que d'utiliser router.push pour plus de contrôle
      window.location.href = '/dashboard';
      // Ne pas désactiver l'état de chargement ici - nous voulons qu'il reste actif jusqu'à la navigation complète
    }
  }, [isAuthenticated, authLoading]);
  
  // Gérer la soumission du formulaire
  const onSubmit = async (data: LoginCredentials) => {
    try {
      // Activer l'état de chargement
      setIsLoading(true);
      await login(data);
      // Ne pas désactiver l'état de chargement ici - il doit rester actif pendant la redirection
    } catch (err) {
      console.error('Erreur de connexion:', err);
      // Désactiver l'état de chargement uniquement en cas d'erreur
      setIsLoading(false);
    }
  };
  
  // Ne rien afficher pendant le chargement initial de l'authentification
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-md relative">
          {/* Overlay de chargement qui s'affiche pendant la soumission et la redirection */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
              <div className="flex flex-col items-center">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="mt-2 text-sm font-medium text-blue-800">Connexion en cours...</p>
              </div>
            </div>
          )}
          
          <CardContent className="pt-6 pb-4">
            {/* Titre unique et description */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">DeadlineManager</h1>
              <p className="mt-1 text-sm text-slate-600">
                Connectez-vous pour gérer vos échéances
              </p>
            </div>
            
            {/* Messages d'erreur ou de succès */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error.message || 'Erreur de connexion. Veuillez réessayer.'}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-2 text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}
            
            {/* Formulaire de connexion */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                disabled={isLoading}
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
                disabled={isLoading}
                {...register('password', { 
                  required: 'Le mot de passe est requis',
                })}
              />
              
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full mt-4"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
            
            {/* Note minimale en bas */}
            <p className="text-xs text-center text-slate-500 mt-6">
              Pas de compte ? Contactez votre administrateur.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}