/**
 * Utilitaires généraux pour l'application
 * @module lib/utils
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fonction utilitaire pour combiner des classes conditionnelles
 * Utilise clsx pour gérer les conditions et twMerge pour résoudre les conflits Tailwind CSS
 * @param inputs - Classes conditionnelles à combiner
 * @returns Chaîne de classes CSS combinées et nettoyées
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date au format local
 * @param date - Date à formater
 * @returns Chaîne de date formatée
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formate une date et heure au format local
 * @param date - Date à formater
 * @returns Chaîne de date et heure formatée
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Génère une couleur aléatoire cohérente basée sur une chaîne
 * @param str - Chaîne d'entrée
 * @returns Code couleur hexadécimal
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

/**
 * Tronque un texte à une longueur maximale avec ellipsis
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale (défaut: 100)
 * @returns Texte tronqué avec ellipsis si nécessaire
 */
export function truncateText(text: string, maxLength: number = 100): string {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}