/**
 * Composant Select personnalisé
 * Liste déroulante réutilisable avec support d'erreurs et d'états
 * @module components/ui/Select
 */
import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Option pour le Select
 */
export interface SelectOption {
  /** Valeur de l'option */
  value: string;
  /** Texte à afficher */
  label: string;
  /** Désactive l'option si true */
  disabled?: boolean;
}

/**
 * Props spécifiques au composant Select
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Message d'erreur à afficher sous le select */
  error?: string;
  /** Label à afficher au-dessus du select */
  label?: string;
  /** Texte d'aide à afficher sous le select */
  helperText?: string;
  /** Options du select */
  options: SelectOption[];
  /** Taille du select */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant Select personnalisé
 * @param props - Propriétés du select
 * @returns Composant Select
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, helperText, options, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    const selectClasses = cn(
      "flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      sizeClasses[size],
      error && "border-red-500 focus:ring-red-500",
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
        <select
          className={selectClasses}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-500' : 'text-slate-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };