/**
 * Composant Textarea personnalisé
 * Champ de saisie multi-lignes avec support d'erreurs et d'états
 * @module components/ui/Textarea
 */
import React, { TextareaHTMLAttributes, forwardRef, useState } from 'react';
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
  ({ className, error, label, helperText, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

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
            "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:outline-none",
            error 
              ? "border-red-500 focus:border-red-500" 
              : isFocused 
                ? "border-blue-500 focus:border-blue-500" 
                : "border-slate-300",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
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