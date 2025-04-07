/**
 * Composant DatePicker personnalisé
 * Champ de saisie de date avec calendrier
 * @module components/ui/DatePicker
 */
import React, { forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';

/**
 * Props spécifiques au composant DatePicker
 */
export interface DatePickerProps {
  /** Date sélectionnée */
  selected: Date | null;
  /** Fonction appelée lors du changement de date */
  onChange: (date: Date | null) => void;
  /** Label à afficher au-dessus du datepicker */
  label?: string;
  /** Message d'erreur à afficher sous le datepicker */
  error?: string;
  /** Texte d'aide à afficher sous le datepicker */
  helperText?: string;
  /** Date minimale sélectionnable */
  minDate?: Date;
  /** Date maximale sélectionnable */
  maxDate?: Date;
  /** Afficher l'heure si true */
  showTimeSelect?: boolean;
  /** Désactive le datepicker si true */
  disabled?: boolean;
  /** Classes CSS supplémentaires */
  className?: string;
  /** Format de date à afficher */
  dateFormat?: string;
  /** Placeholder à afficher quand aucune date n'est sélectionnée */
  placeholderText?: string;
}

/**
 * Composant DatePicker personnalisé
 * @param props - Propriétés du datepicker
 * @returns Composant DatePicker
 */
const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  ({ 
    selected, 
    onChange, 
    label, 
    error, 
    helperText, 
    disabled, 
    className,
    dateFormat = "dd/MM/yyyy",
    showTimeSelect = false,
    placeholderText = "Sélectionner une date...",
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputClasses = cn(
      "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-red-500 focus:ring-red-500",
      disabled && "bg-slate-100 cursor-not-allowed opacity-75",
      className
    );

    const formatWithTime = showTimeSelect 
      ? "dd/MM/yyyy HH:mm" 
      : dateFormat;

    return (
      <div ref={ref} className="space-y-1">
        {label && (
          <label
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          dateFormat={formatWithTime}
          showTimeSelect={showTimeSelect}
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Heure"
          placeholderText={placeholderText}
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

DatePicker.displayName = "DatePicker";

export { DatePicker };