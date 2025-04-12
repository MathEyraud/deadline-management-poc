/**
 * Composant Tooltip
 * Affiche une info-bulle au survol d'un élément
 * @module components/ui/Tooltip
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Props pour le composant Tooltip
 */
interface TooltipProps {
  /** Contenu du tooltip */
  content: React.ReactNode;
  
  /** Élément enfant sur lequel le tooltip sera déclenché */
  children: React.ReactNode;
  
  /** Délai avant l'affichage en millisecondes */
  delay?: number;
  
  /** Position du tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant Tooltip - Affiche une info-bulle au survol
 * @param props - Propriétés du composant
 * @returns Composant Tooltip
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 300,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fonction pour calculer la position du tooltip
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    const top = triggerRect.top + scrollY;
    const left = triggerRect.left + scrollX;
    
    let newStyles: React.CSSProperties = {};
    
    switch (position) {
      case 'top':
        newStyles = {
          bottom: `${window.innerHeight - top + 5}px`,
          left: `${left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`,
        };
        break;
      case 'bottom':
        newStyles = {
          top: `${top + triggerRect.height + 5}px`,
          left: `${left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`,
        };
        break;
      case 'left':
        newStyles = {
          top: `${top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`,
          right: `${window.innerWidth - left + 5}px`,
        };
        break;
      case 'right':
        newStyles = {
          top: `${top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`,
          left: `${left + triggerRect.width + 5}px`,
        };
        break;
    }
    
    setTooltipStyles(newStyles);
  };
  
  // Montre le tooltip
  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calcule la position après que le tooltip soit visible
      setTimeout(calculatePosition, 0);
    }, delay);
  };
  
  // Cache le tooltip
  const hideTooltip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };
  
  // Nettoie le timer lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 px-2 py-1 text-xs text-white bg-slate-800 rounded pointer-events-none",
            className
          )}
          style={tooltipStyles}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;