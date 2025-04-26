/**
 * Composant ButtonGroup
 * Groupe de boutons avec un style cohérent et joint
 * @module components/ui/ButtonGroup
 */
import React, { ReactElement, ReactNode, JSXElementConstructor } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props pour le composant ButtonGroup
 */
interface ButtonGroupProps {
  /** Contenu du groupe de boutons (typiquement des composants Button) */
  children: ReactNode;
  /** Variante de style du groupe */
  variant?: 'default' | 'outline';
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Type pour représenter un élément React avec className dans ses props
 */
type ReactElementWithClassName = ReactElement<{
  className?: string;
  [key: string]: any;
}, JSXElementConstructor<any>>;

/**
 * Composant ButtonGroup - Affiche un groupe de boutons joints visuellement
 * @param props - Propriétés du composant
 * @returns Composant ButtonGroup
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return (
    <div 
      className={cn(
        "inline-flex rounded-md shadow-sm", 
        variant === 'outline' ? 'border border-slate-200' : '',
        className
      )} 
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        // Vérifier si l'enfant est un élément React valide
        if (!React.isValidElement(child)) {
          return child;
        }
        
        // Cast sécurisé avec un type qui garantit l'existence de className
        const elementChild = child as ReactElementWithClassName;
        const childProps = elementChild.props;
        
        // Calculer les classes spécifiques en fonction de la position
        const buttonClassName = cn(
          childProps.className || '',
          // Arrondir uniquement les coins extérieurs du groupe
          index === 0 ? 'rounded-r-none' : '',
          index === React.Children.count(children) - 1 ? 'rounded-l-none' : '',
          index > 0 && index < React.Children.count(children) - 1 ? 'rounded-none' : '',
          // Ajouter une bordure entre les boutons
          index > 0 ? '-ml-px' : ''
        );
        
        // Créer un nouvel objet de props pour éviter les problèmes de spread
        const newProps = { ...childProps, className: buttonClassName };
        
        // Cloner l'élément avec les nouvelles props
        return React.cloneElement(elementChild, newProps);
      })}
    </div>
  );
};

export default ButtonGroup;