import React from 'react';

interface CardProps {
  /**
   * Contenu de la carte
   */
  children: React.ReactNode;
  
  /**
   * Classes CSS supplémentaires
   */
  className?: string;
}

/**
 * Composant Card réutilisable pour afficher du contenu dans un cadre stylisé
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant Card
 */
export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  /**
   * Contenu de l'en-tête
   */
  children: React.ReactNode;
  
  /**
   * Classes CSS supplémentaires
   */
  className?: string;
}

/**
 * En-tête de carte avec bordure inférieure
 */
Card.Header = function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-4 py-5 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

interface CardBodyProps {
  /**
   * Contenu du corps
   */
  children: React.ReactNode;
  
  /**
   * Classes CSS supplémentaires
   */
  className?: string;
}

/**
 * Corps principal de la carte
 */
Card.Body = function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`px-4 py-5 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  /**
   * Contenu du pied de page
   */
  children: React.ReactNode;
  
  /**
   * Classes CSS supplémentaires
   */
  className?: string;
}

/**
 * Pied de page de la carte avec bordure supérieure
 */
Card.Footer = function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-4 py-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
