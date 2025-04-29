/**
 * Composant pour afficher visuellement le niveau de visibilité d'une échéance
 * Fournit un indicateur visuel et une explication du niveau d'accès
 * @module components/deadline/VisibilityIndicator
 */
import React from 'react';
import { Eye, EyeOff, Users, Building, Globe } from 'lucide-react';
import { DeadlineVisibility } from '@/types';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

/**
 * Props pour le composant VisibilityIndicator
 */
interface VisibilityIndicatorProps {
  /** Niveau de visibilité de l'échéance */
  visibility: string;
  /** Afficher le label textuel à côté de l'icône */
  showLabel?: boolean;
  /** Taille de l'icône */
  size?: 'sm' | 'md' | 'lg';
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant pour indiquer visuellement le niveau de visibilité d'une échéance
 * @param props - Propriétés du composant
 * @returns Composant VisibilityIndicator
 */
export const VisibilityIndicator: React.FC<VisibilityIndicatorProps> = ({ 
  visibility, 
  showLabel = false,
  size = 'md',
  className = '' 
}) => {
  // Tailles d'icônes
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };
  
  // Configuration selon le niveau de visibilité
  let iconComponent;
  let label;
  let tooltip;
  let colorClass;
  
  switch (visibility) {
    case DeadlineVisibility.PRIVATE:
      iconComponent = <EyeOff className={cn(sizeClasses[size], "text-slate-600")} />;
      label = "Privée";
      tooltip = "Privée - Visible uniquement par vous";
      colorClass = "text-slate-600 bg-slate-100";
      break;
    case DeadlineVisibility.TEAM:
      iconComponent = <Users className={cn(sizeClasses[size], "text-blue-600")} />;
      label = "Équipe";
      tooltip = "Équipe - Visible par les membres de l'équipe";
      colorClass = "text-blue-600 bg-blue-50";
      break;
    case DeadlineVisibility.DEPARTMENT:
      iconComponent = <Building className={cn(sizeClasses[size], "text-indigo-600")} />;
      label = "Département";
      tooltip = "Département - Visible par tout le département";
      colorClass = "text-indigo-600 bg-indigo-50";
      break;
    case DeadlineVisibility.ORGANIZATION:
      iconComponent = <Globe className={cn(sizeClasses[size], "text-green-600")} />;
      label = "Organisation";
      tooltip = "Organisation - Visible par toute l'organisation";
      colorClass = "text-green-600 bg-green-50";
      break;
    default:
      iconComponent = <Eye className={cn(sizeClasses[size], "text-slate-600")} />;
      label = "Inconnue";
      tooltip = "Visibilité inconnue";
      colorClass = "text-slate-600 bg-slate-100";
  }

  return (
    <Tooltip content={tooltip}>
      <div className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        colorClass,
        showLabel ? "space-x-1" : "",
        className
      )}>
        {iconComponent}
        {showLabel && <span className="text-xs font-medium">{label}</span>}
      </div>
    </Tooltip>
  );
};

export default VisibilityIndicator;