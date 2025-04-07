/**
 * Composant Textarea personnalisé
 * Champ de saisie multi-lignes avec support d'erreurs et d'états
 * @module components/ui/Textarea
 */
import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props spécifiques au composant Textarea
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Message d'erreur à afficher sous le textarea */
  error?: string;
  /** Label à afficher au-dessus du textarea */
  label?: string;
  /** Texte d'aide à afficher sous le textarea */
  helperText?: string;
}

/**
 * Composant Textarea personnalisé
 * @param props - Propriétés du textarea
 * @returns Composant Textarea
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, ...props }, ref) => {
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
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-500' : 'text-slate-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };