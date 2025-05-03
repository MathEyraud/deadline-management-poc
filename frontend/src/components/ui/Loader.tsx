/**
 * Composant Loader personnalisé
 * Affiche une animation de chargement avec différentes variantes
 * @module components/ui/Loader
 */
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props pour le composant Loader
 */
export interface LoaderProps {
  /** Taille du loader */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Couleur du loader */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'light';
  /** Variante d'animation */
  variant?: 'spinner' | 'dots' | 'pulse' | 'logo';
  /** Texte à afficher sous le loader */
  text?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Si le loader doit prendre tout l'espace du container */
  fullWidth?: boolean;
  /** Si le loader doit être centré verticalement */
  centered?: boolean;
  /** Si le loader doit avoir un fond translucide */
  overlay?: boolean;
}

/**
 * Composant Loader - Affiche une animation de chargement personnalisée
 * @param props - Propriétés du composant
 * @returns Composant Loader
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'spinner',
  text,
  className = '',
  fullWidth = false,
  centered = false,
  overlay = false,
}) => {
  // Classes de taille
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Classes de couleur
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-slate-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-amber-600',
    light: 'text-white',
  };

  // Sélection du loader en fonction de la variante
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={cn('animate-spin', sizeClasses[size], colorClasses[color])}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-full animate-bounce',
                  sizeClasses[size].split(' ')[0],
                  sizeClasses[size].split(' ')[0],
                  colorClasses[color],
                  'bg-current'
                )}
                style={{ animationDelay: `${idx * 0.15}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            'animate-pulse rounded-full',
            sizeClasses[size],
            colorClasses[color],
            'bg-current'
          )} />
        );
      
      case 'logo':
        // Logo de l'application stylisé et animé
        // Cette variante est un placeholder pour le logo personnalisé à venir
        return (
          <div className={cn('animate-pulse', sizeClasses[size], colorClasses[color])}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Si le loader est un overlay (couvre le parent avec un fond translucide)
  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <div className="flex flex-col items-center">
          {renderLoader()}
          {text && <p className={cn('mt-2 text-sm font-medium', colorClasses[color])}>{text}</p>}
        </div>
      </div>
    );
  }

  // Sinon, rendu normal
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        fullWidth && 'w-full',
        centered && 'h-full',
        className
      )}
    >
      {renderLoader()}
      {text && <p className={cn('mt-2 text-sm font-medium', colorClasses[color])}>{text}</p>}
    </div>
  );
};

export default Loader;