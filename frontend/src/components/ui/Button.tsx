'use client';

import React from 'react';

/**
 * Types de variantes pour le bouton
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

/**
 * Tailles de bouton disponibles
 */
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante de style du bouton
   */
  variant?: ButtonVariant;
  
  /**
   * Taille du bouton
   */
  size?: ButtonSize;
  
  /**
   * Contenu du bouton
   */
  children: React.ReactNode;
}

/**
 * Composant Button réutilisable avec différentes variantes et tailles
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant Button
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Styles de base communs à toutes les variantes
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Styles spécifiques à chaque variante
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  // Styles spécifiques à chaque taille
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Styles supplémentaires pour l'état désactivé
  const disabledStyles = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';
  
  // Assembler toutes les classes CSS
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;
  
  return (
    <button 
      className={buttonStyles} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  );
};
