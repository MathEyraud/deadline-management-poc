/**
 * Composant Card
 * Conteneur de type carte avec différentes sections (Header, Title, Description, Content, Footer)
 * Ce composant peut être utilisé pour structurer des cartes avec des informations hiérarchisées.
 * @module components/ui/Card
 */
import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils"; // Utilitaire pour gérer les classes conditionnelles

/**
 * Props pour le composant Card
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Ajoute une ombre si true */
  withShadow?: boolean; 
}

/**
 * Composant Card
 * Ce composant principal représente la carte elle-même.
 * Il peut avoir une ombre si la prop `withShadow` est activée.
 * @param props - Propriétés du composant Card
 * @returns Le composant Card
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, withShadow = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-slate-200 bg-white", // Classes de base pour la carte
          withShadow && "shadow-sm", // Ajoute l'ombre si withShadow est true
          className // Permet d'ajouter des classes personnalisées
        )}
        {...props} // Transfert les autres props vers le div
      />
    );
  }
);

// Ajout du displayName pour le débogage dans React DevTools
Card.displayName = "Card";

/**
 * Composant CardHeader
 * Conteneur de la partie supérieure de la carte, généralement utilisé pour un titre ou des informations importantes.
 * @param props - Propriétés du composant CardHeader
 * @returns Le composant CardHeader
 */
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)} // Styles de base pour le header
      {...props} // Transfert les autres props vers le div
    />
  )
);
CardHeader.displayName = "CardHeader";

/**
 * Composant CardTitle
 * Le titre de la carte, généralement un élément de texte important.
 * @param props - Propriétés du composant CardTitle
 * @returns Le composant CardTitle
 */
const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight", // Classes de base pour le titre
        className // Permet d'ajouter des classes personnalisées
      )}
      {...props} // Transfert les autres props vers le h3
    />
  )
);
CardTitle.displayName = "CardTitle";

/**
 * Composant CardDescription
 * Description de la carte, généralement un paragraphe expliquant de manière plus détaillée.
 * @param props - Propriétés du composant CardDescription
 * @returns Le composant CardDescription
 */
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-slate-500", className)} // Styles de base pour la description
      {...props} // Transfert les autres props vers le paragraphe
    />
  )
);
CardDescription.displayName = "CardDescription";

/**
 * Composant CardContent
 * Conteneur pour le contenu principal de la carte, généralement utilisé pour placer des informations supplémentaires.
 * @param props - Propriétés du composant CardContent
 * @returns Le composant CardContent
 */
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

/**
 * Composant CardFooter
 * Conteneur pour le bas de la carte, généralement utilisé pour placer des actions ou des informations supplémentaires.
 * @param props - Propriétés du composant CardFooter
 * @returns Le composant CardFooter
 */
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)} // Styles de base pour le footer
      {...props} // Transfert les autres props vers le div
    />
  )
);
CardFooter.displayName = "CardFooter";

// Exportation des composants pour être utilisés ailleurs dans l'application
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
