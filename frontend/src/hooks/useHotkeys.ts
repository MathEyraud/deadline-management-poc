/**
 * Hook pour gérer les raccourcis clavier
 * @module hooks/useHotkeys
 */
import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;
type KeyCombo = string; // format: 'mod+k', 'shift+a', etc.

/**
 * Vérifie si le combo de touches correspond à l'événement
 * @param combo - Combinaison de touches à vérifier
 * @param event - Événement clavier
 * @returns true si la combinaison correspond
 */
const matchesKeyCombo = (combo: KeyCombo, event: KeyboardEvent): boolean => {
  const parts = combo.toLowerCase().split('+');
  
  // Traite 'mod' comme Cmd sur Mac et Ctrl ailleurs
  const mod = navigator.platform.indexOf('Mac') !== -1 ? 'meta' : 'control';
  
  // Remplace 'mod' par la touche modifier appropriée
  const keys = parts.map(part => (part === 'mod' ? mod : part));
  
  // Vérifie si toutes les touches modifier requises sont actives
  const modifiersMatch = keys.every(key => {
    if (key === 'control' || key === 'ctrl') return event.ctrlKey;
    if (key === 'shift') return event.shiftKey;
    if (key === 'alt') return event.altKey;
    if (key === 'meta') return event.metaKey;
    return true;
  });
  
  // Vérifie si la touche principale correspond
  const mainKey = keys[keys.length - 1];
  const keyMatch = mainKey.length === 1 
    ? event.key.toLowerCase() === mainKey
    : event.code.toLowerCase() === `key${mainKey}`;
  
  return modifiersMatch && keyMatch;
};

/**
 * Hook qui exécute une fonction lorsqu'un raccourci clavier est détecté
 * @param keyCombo - Combinaison de touches à surveiller
 * @param callback - Fonction à exécuter lorsque la combinaison est détectée
 * @param element - Élément à surveiller (document par défaut)
 */
export function useHotkeys(
  keyCombo: KeyCombo, 
  callback: KeyHandler, 
  element: HTMLElement | Document = document
) {
  useEffect(() => {
    const handler = (e: Event) => {
      // Conversion explicite de Event en KeyboardEvent
      const kbEvent = e as KeyboardEvent;
      
      if (matchesKeyCombo(keyCombo, kbEvent)) {
        callback(kbEvent);
      }
    };
    
    element.addEventListener('keydown', handler);
    
    return () => {
      element.removeEventListener('keydown', handler);
    };
  }, [keyCombo, callback, element]);
}