/**
 * Composant MultiSelect
 * Select multiple avec recherche intégrée
 * @module components/ui/MultiSelect
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Search, ChevronDown, ChevronUp, Check } from 'lucide-react';

/**
 * Option pour le MultiSelect
 */
export interface MultiSelectOption {
  /** Valeur de l'option */
  value: string;
  /** Texte principal à afficher */
  label: string;
  /** Texte secondaire à afficher (ex: email) */
  description?: string;
  /** Désactive l'option si true */
  disabled?: boolean;
}

/**
 * Props pour le composant MultiSelect
 */
export interface MultiSelectProps {
  /** Options disponibles pour la sélection */
  options: MultiSelectOption[];
  /** Valeurs actuellement sélectionnées */
  selectedValues: string[];
  /** Fonction appelée lors de la sélection de nouvelles options */
  onChange: (selectedValues: string[]) => void;
  /** Texte du placeholder */
  placeholder?: string;
  /** Texte affiché quand aucune option n'est disponible */
  noOptionsMessage?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Label à afficher au-dessus du select */
  label?: string;
  /** Message d'erreur à afficher */
  error?: string;
  /** Si le contrôle est désactivé */
  disabled?: boolean;
  /** Hauteur maximale de la dropdown */
  maxDropdownHeight?: string;
  /** Afficher les tags en inline ou sous le champ */
  tagsPosition?: 'inline' | 'below';
}

/**
 * Composant MultiSelect - Select multiple avec recherche intégrée
 * @param props - Propriétés du composant
 * @returns Composant MultiSelect
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Sélectionner...',
  noOptionsMessage = 'Aucune option disponible',
  className = '',
  label,
  error,
  disabled = false,
  maxDropdownHeight = '200px',
  tagsPosition = 'below'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ferme le dropdown lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filtre les options selon le terme de recherche
  const filteredOptions = options.filter(option => 
    !option.disabled && 
    (option.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  // Récupère les options sélectionnées
  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.value)
  );
  
  // Fonction pour ajouter ou supprimer une option
  const toggleOption = (value: string) => {
    const isSelected = selectedValues.includes(value);
    
    if (isSelected) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };
  
  // Fonction pour supprimer toutes les sélections
  const clearAll = () => {
    onChange([]);
    setSearchTerm('');
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      
      <div 
        ref={containerRef} 
        className={cn(
          "relative",
          className
        )}
      >
        {/* Zone de sélection principale */}
        <div 
          className={cn(
            "flex flex-wrap min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2",
            error && "border-red-500 focus-within:ring-red-500",
            disabled && "bg-slate-100 cursor-not-allowed opacity-75"
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {tagsPosition === 'inline' && selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1 items-center mr-2">
              {selectedOptions.map(option => (
                <div 
                  key={option.value}
                  className="bg-slate-100 text-slate-800 rounded-md px-2 py-1 text-xs flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate max-w-[150px]">{option.label}</span>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option.value);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          
          {/* Input de recherche intégré */}
          <div className="flex-grow flex items-center">
            <input
              type="text"
              className={cn(
                "w-full border-0 p-0 focus:outline-none focus:ring-0 bg-transparent",
                disabled && "cursor-not-allowed"
              )}
              placeholder={selectedOptions.length === 0 ? placeholder : ""}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => !disabled && setIsOpen(true)}
              disabled={disabled}
            />
          </div>
          
          {/* Indicateur du nombre d'éléments sélectionnés */}
          {selectedOptions.length > 0 && tagsPosition === 'inline' && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
              >
                Effacer
              </button>
            </div>
          )}
          
          {/* Icône d'ouverture/fermeture */}
          <div className="ml-auto flex items-center">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
        
        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
            {/* Barre de recherche */}
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-8 pr-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            {/* Liste des options */}
            <div className={`overflow-y-auto`} style={{ maxHeight: maxDropdownHeight }}>
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-center text-sm text-slate-500">
                  {noOptionsMessage}
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div 
                    key={option.value} 
                    className={cn(
                      "px-2 py-1.5 hover:bg-slate-100 cursor-pointer flex items-center",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!option.disabled) {
                        toggleOption(option.value);
                      }
                    }}
                  >
                    <div className="mr-2 flex-shrink-0">
                      <div className={cn(
                        "w-4 h-4 border rounded flex items-center justify-center",
                        selectedValues.includes(option.value) 
                          ? "border-blue-500 bg-blue-500" 
                          : "border-slate-300"
                      )}>
                        {selectedValues.includes(option.value) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-800">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-slate-500">{option.description}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer avec statistiques de sélection */}
            {selectedOptions.length > 0 && (
              <div className="p-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>{selectedOptions.length} élément{selectedOptions.length > 1 ? 's' : ''} sélectionné{selectedOptions.length > 1 ? 's' : ''}</span>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 underline"
                  onClick={() => clearAll()}
                >
                  Tout désélectionner
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Affichage des éléments sélectionnés sous le champ si position 'below' */}
        {tagsPosition === 'below' && selectedOptions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedOptions.map(option => (
              <div 
                key={option.value}
                className="bg-slate-100 text-slate-800 rounded-md pl-2 pr-1 py-1 text-sm flex items-center"
              >
                <div className="flex flex-col mr-1">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-slate-500">{option.description}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-700 rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.value);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedOptions.length > 0 && (
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700 underline self-end"
                onClick={() => clearAll()}
              >
                Tout désélectionner
              </button>
            )}
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;