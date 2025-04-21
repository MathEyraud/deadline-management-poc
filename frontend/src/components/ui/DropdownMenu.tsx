/**
 * Composant DropdownMenu amélioré
 * Menu contextuel déroulant pour les actions avec positionnement intelligent
 * @module components/ui/DropdownMenu
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props pour le composant DropdownMenu
 */
interface DropdownMenuProps {
  /** Élément déclencheur du menu */
  trigger: React.ReactNode;
  
  /** Contenu du menu */
  children: React.ReactNode;
  
  /** Alignement du menu par rapport au déclencheur */
  align?: 'left' | 'right';
  
  /** Direction de l'ouverture du menu */
  direction?: 'down' | 'up';
  
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant DropdownMenu - Menu déroulant pour les actions avec positionnement dynamique
 * @param props - Propriétés du composant
 * @returns Composant DropdownMenu
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  align = 'right',
  direction = 'down',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    direction: direction,
    align: align
  });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Calcule la position optimale du menu basée sur l'espace disponible
  const calculateOptimalPosition = () => {
    if (!triggerRef.current || !menuRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calcul pour la direction (haut/bas)
    let newDirection = direction;
    if (direction === 'down' && triggerRect.bottom + menuRect.height > viewportHeight) {
      // Si le menu dépasse en bas, on l'affiche vers le haut
      newDirection = 'up';
    } else if (direction === 'up' && triggerRect.top - menuRect.height < 0) {
      // Si le menu dépasse en haut, on l'affiche vers le bas
      newDirection = 'down';
    }
    
    // Calcul pour l'alignement (gauche/droite)
    let newAlign = align;
    if (align === 'right' && triggerRect.right + menuRect.width > viewportWidth) {
      // Si le menu dépasse à droite, on l'aligne à gauche
      newAlign = 'left';
    } else if (align === 'left' && triggerRect.left - menuRect.width < 0) {
      // Si le menu dépasse à gauche, on l'aligne à droite
      newAlign = 'right';
    }
    
    setMenuPosition({
      direction: newDirection as 'up' | 'down',
      align: newAlign as 'left' | 'right'
    });
  };
  
  // Effectue le calcul de position quand le menu s'ouvre
  useEffect(() => {
    if (isOpen) {
      calculateOptimalPosition();
      
      // Recalculer si la taille de la fenêtre change
      window.addEventListener('resize', calculateOptimalPosition);
      
      return () => {
        window.removeEventListener('resize', calculateOptimalPosition);
      };
    }
  }, [isOpen]);
  
  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);
  
  // Détermine les classes CSS pour le positionnement du menu
  const getMenuPositionClasses = () => {
    const classes = [];
    
    // Classes pour la direction
    if (menuPosition.direction === 'up') {
      classes.push('bottom-full mb-2');
    } else {
      classes.push('top-full mt-2');
    }
    
    // Classes pour l'alignement
    if (menuPosition.align === 'left') {
      classes.push('left-0');
    } else {
      classes.push('right-0');
    }
    
    return classes.join(' ');
  };
  
  return (
    <div className="relative inline-block text-left">
      {/* Élément déclencheur */}
      <div 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      
      {/* Menu déroulant */}
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute z-50 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none",
            getMenuPositionClasses(),
            className
          )}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

/**
 * Props pour le composant DropdownMenuItem
 */
interface DropdownMenuItemProps {
  /** Fonction appelée lors du clic sur l'élément */
  onClick?: (e: React.MouseEvent) => void;
  
  /** Contenu de l'élément */
  children: React.ReactNode;
  
  /** Indique si l'élément est dangereux (rouge) */
  danger?: boolean;
  
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant DropdownMenuItem - Élément d'un menu déroulant
 * @param props - Propriétés du composant
 * @returns Composant DropdownMenuItem
 */
export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  onClick,
  children,
  danger = false,
  className = ''
}) => {
  return (
    <button
      className={cn(
        "block w-full text-left px-4 py-2 text-sm",
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
};

export default { DropdownMenu, DropdownMenuItem };