/**
 * Hook pour détecter les clics en dehors d'un élément
 * @module hooks/useClickAway
 */
import { useEffect, RefObject } from 'react';

/**
 * Hook qui exécute une fonction lorsqu'un clic se produit en dehors des éléments référencés
 * @param refs - Tableau de références aux éléments à surveiller
 * @param handler - Fonction à exécuter lors d'un clic extérieur
 */
export function useClickAway(
  refs: RefObject<HTMLElement | null>[], 
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Vérifie si le clic est en dehors de tous les éléments référencés
      const clickedOutside = refs.every((ref) => {
        return !ref.current || !ref.current.contains(event.target as Node);
      });
      
      if (clickedOutside) {
        handler(event);
      }
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
}