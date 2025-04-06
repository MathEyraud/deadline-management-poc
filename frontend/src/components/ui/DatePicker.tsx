import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';

interface DatePickerProps {
  /**
   * ID de l'élément
   */
  id?: string;
  
  /**
   * Nom du champ pour les formulaires
   */
  name?: string;
  
  /**
   * Date sélectionnée
   */
  selected: Date | null;
  
  /**
   * Gestionnaire de changement
   */
  onChange: (date: Date) => void;
  
  /**
   * Message d'erreur à afficher
   */
  error?: string;
  
  /**
   * Texte d'espace réservé
   */
  placeholder?: string;
  
  /**
   * Classes CSS supplémentaires
   */
  className?: string;
}

/**
 * Composant DatePicker personnalisé avec style cohérent avec les autres composants de formulaire
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant DatePicker
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  selected,
  onChange,
  error,
  placeholder = 'Sélectionner une date',
  className = ''
}) => {
  // Styles de base pour tous les inputs
  const baseStyles = 'w-full px-3 py-2 border rounded-md text-sm';
  
  // Appliquer des styles spécifiques selon qu'il y a une erreur ou non
  const statusStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  
  // Assembler toutes les classes CSS
  const inputStyles = `${baseStyles} ${statusStyles} ${className}`;
  
  // Personnalisation de l'input
  const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ value, onClick, onChange, placeholder }, ref) => (
      <input
        ref={ref}
        value={value as string}
        onChange={onChange}
        onClick={onClick}
        placeholder={placeholder}
        className={inputStyles}
        readOnly
      />
    )
  );
  
  CustomInput.displayName = 'DatePickerInput';
  
  return (
    <div className="w-full">
      <ReactDatePicker
        id={id}
        name={name}
        selected={selected}
        onChange={onChange}
        customInput={<CustomInput placeholder={placeholder} />}
        dateFormat="dd/MM/yyyy"
        locale={fr}
        showPopperArrow={false}
        popperPlacement="bottom-start"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
