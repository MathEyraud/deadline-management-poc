/**
 * Composant Select personnalisé
 * Liste déroulante réutilisable avec support d'erreurs et d'états
 * @module components/ui/Select
 */
import React, { SelectHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const [isFocused, setIsFocused] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [isMounted, setIsMounted] = useState(false);
    
    const selectRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Classes en fonction de la taille
    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    // Vérifier si le DOM est disponible pour créer le portail
    useEffect(() => {
      setIsMounted(true);
      return () => setIsMounted(false);
    }, []);

    // Filtrer les options en fonction du terme de recherche
    const filteredOptions = options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Trouver l'option actuellement sélectionnée
    const selectedOption = options.find(option => option.value === selectedValue);

    // Calculer la position du dropdown
    useEffect(() => {
      if (isOpen && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, [isOpen]);

    // Gérer le clic à l'extérieur pour fermer le dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // Ne pas fermer si on clique sur le select lui-même
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          // Vérifier si le clic est dans le dropdown (qui est en dehors de la hiérarchie DOM normale)
          const dropdownElement = document.getElementById('select-dropdown');
          if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
            setIsOpen(false);
            setIsFocused(false);
          }
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Focus automatique sur la barre de recherche quand le dropdown s'ouvre
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

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

    // Gérer la navigation au clavier dans le dropdown
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
      } else {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          // Logique pour naviguer vers le bas
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          // Logique pour naviguer vers le haut
        } else if (e.key === 'Enter') {
          // Logique pour sélectionner l'option actuelle
        }
      }
    };

    // Rendu du dropdown via un portail
    const renderDropdown = () => {
      if (!isOpen || !isMounted) return null;
      
      const dropdownContent = (
        <div 
          id="select-dropdown"
          className="z-50 rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden"
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {/* Barre de recherche (visible uniquement si searchable est true) */}
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  tabIndex={0}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      );
      
      return createPortal(dropdownContent, document.body);
    };

    // Implémentation personnalisée pour avoir un comportement cohérent
    const selectClasses = cn(
      "flex w-full rounded-md border transition-all",
      isFocused 
        ? "border-blue-500" 
        : "border-slate-300",
      sizeClasses[size],
      error && "border-red-500",
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
              "px-3 py-2 text-left focus:outline-none bg-white disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 flex items-center justify-between"
            )}
            onClick={() => {
              if (!props.disabled) {
                setIsOpen(!isOpen);
                setIsFocused(true);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              // Ne pas perdre le focus si on clique dans le dropdown
              if (!e.relatedTarget || !selectRef.current?.contains(e.relatedTarget as Node)) {
                if (!isOpen) {
                  setIsFocused(false);
                }
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={props.disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? props.id : undefined}
          >
            <span className={cn("truncate", !selectedOption && "text-slate-400")}>
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
          
          {/* Dropdown rendu via portail */}
          {renderDropdown()}
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