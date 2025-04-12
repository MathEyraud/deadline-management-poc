/**
 * Indicateur de l'état de santé du service IA
 * Affiche un point coloré et optionnellement des informations sur le statut
 * @module components/ai/AIStatusIndicator
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

/**
 * Props pour le composant AIStatusIndicator
 */
interface AIStatusIndicatorProps {
  /** État de santé du service IA */
  health: { status: string, uptime: number } | null;
  
  /** Si vrai, affiche des détails supplémentaires */
  verbose?: boolean;
  
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant qui indique l'état de disponibilité du service IA
 * @param props - Propriétés du composant
 * @returns Composant d'indicateur d'état
 */
export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({ 
  health, 
  verbose = false, 
  className = ''
}) => {
  // Déterminer l'état du service
  const isAvailable = health !== null && health.status === 'online';
  
  // Formatage du temps de fonctionnement en heures
  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  // Contenu du tooltip
  const tooltipContent = health 
    ? `Service IA ${isAvailable ? 'disponible' : 'dégradé'} (Uptime: ${formatUptime(health.uptime)})` 
    : 'Service IA indisponible';
  
  return (
    <Tooltip content={tooltipContent}>
      <div className={cn("flex items-center", className)}>
        {/* Indicateur coloré */}
        <div 
          className={cn(
            "h-2 w-2 rounded-full", 
            isAvailable ? "bg-green-500" : health ? "bg-amber-500" : "bg-red-500"
          )}
        />
        
        {/* Texte d'état (optionnel) */}
        {verbose && (
          <span className="ml-2 text-xs text-slate-500">
            {isAvailable ? "IA disponible" : "IA indisponible"}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default AIStatusIndicator;