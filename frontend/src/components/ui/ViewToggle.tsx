/**
 * Composant ViewToggle
 * Groupe de boutons permettant de basculer entre différentes vues (liste, tableau)
 * Adaptatif à la taille de l'écran (texte + icône sur desktop, icône seule sur mobile)
 * @module components/ui/ViewToggle
 */
import React from 'react';
import { Button } from '@/components/ui';
import ButtonGroup from '@/components/ui/ButtonGroup';
import { List, Table as TableIcon } from 'lucide-react';

/**
 * Props pour le composant ViewToggle
 */
interface ViewToggleProps {
  /** Mode de vue actuellement actif */
  activeView: string;
  /** Fonction appelée lors du changement de vue */
  onViewChange: (view: string) => void;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant ViewToggle - Bascule entre différentes vues
 * @param props - Propriétés du composant
 * @returns Composant ViewToggle
 */
export const ViewToggle: React.FC<ViewToggleProps> = ({
  activeView,
  onViewChange,
  className = '',
}) => {
  return (
    <ButtonGroup className={className}>
      <Button
        variant={activeView === 'list' ? "primary" : "outline"}
        size="sm"
        onClick={() => onViewChange('list')}
        className="px-2 sm:px-3"
        title="Vue liste"
      >
        <List className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Liste</span>
      </Button>
      <Button
        variant={activeView === 'table' ? "primary" : "outline"}
        size="sm"
        onClick={() => onViewChange('table')}
        className="px-2 sm:px-3"
        title="Vue tableau"
      >
        <TableIcon className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Tableau</span>
      </Button>
    </ButtonGroup>
  );
};

export default ViewToggle;