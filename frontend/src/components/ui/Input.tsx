/**
 * Composant Input personnalisé
 * Champ de saisie texte réutilisable avec support d'erreurs et d'états
 * @module components/ui/Input
 */
import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props spécifiques au composant Input
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Message d'erreur à afficher sous l'input */
  error?: string;
  /** Label à afficher au-dessus de l'input */
  label?: string;
  /** Texte d'aide à afficher sous l'input */
  helperText?: string;
  /** Contenu à afficher à gauche de l'input */
  leftAddon?: React.ReactNode;
  /** Contenu à afficher à droite de l'input */
  rightAddon?: React.ReactNode;
}

/**
 * Composant Input personnalisé
 * @param props - Propriétés de l'input
 * @returns Composant Input
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, helperText, leftAddon, rightAddon, ...props }, ref) => {
    const inputClasses = cn(
      "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-red-500 focus:ring-red-500",
      (leftAddon || rightAddon) && "rounded-none",
      leftAddon && "rounded-r-md",
      rightAddon && "rounded-l-md",
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <div className="relative flex">
          {leftAddon && (
            <div className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-100 px-3 text-slate-500">
              {leftAddon}
            </div>
          )}
          <input
            className={inputClasses}
            ref={ref}
            {...props}
          />
          {rightAddon && (
            <div className="inline-flex items-center rounded-r-md border border-l-0 border-slate-300 bg-slate-100 px-3 text-slate-500">
              {rightAddon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-500' : 'text-slate-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };