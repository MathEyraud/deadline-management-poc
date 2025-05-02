/**
 * Crée une version debounced d'une fonction
 * @param fn - Fonction à debouncer
 * @param delay - Délai en millisecondes
 * @returns Fonction debounced
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return function(this: any, ...args: Parameters<T>) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
        fn.apply(this, args);
        timeoutId = null;
    }, delay);
    };
}