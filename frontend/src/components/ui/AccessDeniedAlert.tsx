/**
 * Composant pour afficher une alerte d'accès refusé
 * Utilisé pour informer l'utilisateur lorsqu'il n'a pas accès à une ressource
 * @module components/ui/AccessDeniedAlert
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props pour le composant AccessDeniedAlert
 */
interface AccessDeniedAlertProps {
  /** Message à afficher */
  message?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant pour afficher une alerte d'accès refusé
 * @param props - Propriétés du composant
 * @returns Composant AccessDeniedAlert
 */
export const AccessDeniedAlert: React.FC<AccessDeniedAlertProps> = ({ 
  message = "Vous n'avez pas l'autorisation d'accéder à cette ressource",
  className = ''
}) => {
  return (
    <div className={cn(
      "flex items-center gap-3 p-4 text-amber-800 bg-amber-50 rounded-lg border border-amber-200",
      className
    )}>
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">{message}</p>
        <p className="text-sm mt-1">
          Cette restriction est basée sur les règles de visibilité et de contrôle d'accès.
        </p>
      </div>
    </div>
  );
};

export default AccessDeniedAlert;