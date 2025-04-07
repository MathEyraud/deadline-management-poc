/**
 * Composant Button personnalisé
 * Bouton réutilisable avec différentes variantes et états
 * @module components/ui/Button
 */
import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Définition des variantes du bouton avec class-variance-authority
 */
const buttonVariants = cva(
  // Classes de base appliquées à tous les boutons
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Variantes de type (couleur)
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-amber-500 text-white hover:bg-amber-600",
        danger: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
        link: "bg-transparent text-slate-900 underline-offset-4 hover:underline",
      },
      // Variantes de taille
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 py-3 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    // Valeurs par défaut
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Props spécifiques au composant Button
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Indique si le bouton est en cours de chargement */
  isLoading?: boolean;
  /** Contenu à afficher à gauche du texte du bouton */
  leftIcon?: React.ReactNode;
  /** Contenu à afficher à droite du texte du bouton */
  rightIcon?: React.ReactNode;
}

/**
 * Composant Button personnalisé
 * @param props - Propriétés du bouton
 * @returns Composant Button
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };