/**
 * Composant Select personnalisé
 * Liste déroulante réutilisable avec support d'erreurs et d'états
 * @module components/ui/Select
 */
import React, { SelectHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

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
  /** Activer la fonctionnalité de recherche */
  searchable?: boolean;
  /** Placeholder pour la barre de recherche */
  searchPlaceholder?: string;
  /** Placeholder à afficher quand aucune option n'est sélectionnée */
  placeholder?: string;
}

/**
 * Composant Select personnalisé
 * @param props - Propriétés du select
 * @returns Composant Select
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    error, 
    label, 
    helperText, 
    options, 
    size = 'md', 
    searchable = false,
    searchPlaceholder = 'Rechercher...',
    onChange,
    value,
    placeholder = 'Sélectionner...',
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState<string>(value as string || '');
    const selectRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);

    // Classes en fonction de la taille
    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    // Filtrer les options en fonction du terme de recherche
    const filteredOptions = options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Trouver l'option actuellement sélectionnée
    const selectedOption = options.find(option => option.value === selectedValue);

    // Gérer le clic à l'extérieur pour fermer le dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Mise à jour de la valeur sélectionnée quand la prop value change
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value as string);
      }
    }, [value]);

    // Fonction pour gérer la sélection d'une option
    const handleOptionSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      
      // Simuler un événement de changement pour le select caché
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = optionValue;
        const event = new Event('change', { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(event);
        
        // Appeler le gestionnaire onChange s'il est fourni
        if (onChange) {
          onChange(event as unknown as React.ChangeEvent<HTMLSelectElement>);
        }
      }
    };

    // Implémentation personnalisée pour avoir un comportement cohérent
    const selectClasses = cn(
      "flex w-full rounded-md border border-slate-300 bg-white",
      sizeClasses[size],
      error && "border-red-500 focus-within:ring-red-500",
      className
    );

    return (
      <div className="space-y-1" ref={selectRef}>
        {label && (
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        
        {/* Select caché pour conserver la compatibilité avec les formulaires */}
        <select
          ref={(el) => {
            // Assigne la référence au select caché
            if (hiddenSelectRef) hiddenSelectRef.current = el;
            // Assigne également la référence passée en prop si elle existe
            if (ref) {
              if (typeof ref === 'function') {
                ref(el);
              } else {
                ref.current = el;
              }
            }
          }}
          value={selectedValue}
          onChange={onChange}
          className="sr-only"
          aria-hidden="true"
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
        
        {/* Bouton personnalisé qui simule un select */}
        <div className="relative">
          <button
            type="button"
            className={cn(
              selectClasses,
              "px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between"
            )}
            onClick={() => !props.disabled && setIsOpen(!isOpen)}
            disabled={props.disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none ml-2">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </span>
          </button>
          
          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
              {/* Barre de recherche (visible uniquement si searchable est true) */}
              {searchable && (
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-8 pr-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
              
              {/* Liste des options */}
              <div className="max-h-60 overflow-y-auto py-1" role="listbox">
                {(searchable ? filteredOptions : options).length === 0 ? (
                  <div className="px-3 py-2 text-center text-sm text-slate-500">
                    Aucun résultat trouvé
                  </div>
                ) : (
                  (searchable ? filteredOptions : options).map((option) => (
                    <div 
                      key={option.value} 
                      className={cn(
                        "px-3 py-2 hover:bg-slate-100 cursor-pointer",
                        option.disabled && "opacity-50 cursor-not-allowed",
                        option.value === selectedValue && "bg-blue-50 text-blue-700 font-medium"
                      )}
                      onClick={() => !option.disabled && handleOptionSelect(option.value)}
                      role="option"
                      aria-selected={option.value === selectedValue}
                    >
                      {option.label}
                    </div>
                  ))
                )}
              </div>
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

Select.displayName = "Select";

export { Select };