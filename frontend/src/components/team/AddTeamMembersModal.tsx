/**
 * Composant Modal pour ajouter plusieurs membres à une équipe
 * @module components/team/AddTeamMembersModal
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useUsersList } from '@/hooks/useUsers';

/**
 * Props pour le composant AddTeamMembersModal
 */
interface AddTeamMembersModalProps {
  /** État d'ouverture de la modal */
  isOpen: boolean;
  /** Fonction pour fermer la modal */
  onClose: () => void;
  /** ID de l'équipe à laquelle ajouter des membres */
  teamId: string;
  /** ID des membres existants (pour les exclure de la sélection) */
  existingMemberIds: string[];
  /** ID du leader de l'équipe (pour l'exclure de la sélection) */
  leaderId?: string;
  /** Fonction appelée après l'ajout réussi des membres */
  onMembersAdded: (memberIds: string[]) => void;
  /** Indique si l'ajout est en cours */
  isLoading?: boolean;
}

/**
 * Modal pour ajouter plusieurs membres à une équipe existante
 * @param props - Propriétés du composant
 * @returns Composant AddTeamMembersModal
 */
export const AddTeamMembersModal: React.FC<AddTeamMembersModalProps> = ({
  isOpen,
  onClose,
  teamId,
  existingMemberIds,
  leaderId,
  onMembersAdded,
  isLoading = false
}) => {
  // État pour les membres sélectionnés
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Récupération de la liste des utilisateurs
  const { data: users = [], isLoading: isLoadingUsers } = useUsersList();
  
  // Réinitialiser la sélection quand la modal s'ouvre/se ferme
  useEffect(() => {
    if (!isOpen) {
      setSelectedMembers([]);
    }
  }, [isOpen]);
  
  // Préparer les options pour le MultiSelect en excluant les membres existants et le leader
  const userOptions = users
    .filter(user => 
      !existingMemberIds.includes(user.id) && 
      user.id !== leaderId
    )
    .map(user => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName}`,
      description: user.email
    }));
  
  // Gérer la soumission du formulaire
  const handleSubmit = () => {
    if (selectedMembers.length > 0) {
      onMembersAdded(selectedMembers);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter des membres à l'équipe"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedMembers.length === 0 || isLoading}
            isLoading={isLoading}
          >
            Ajouter {selectedMembers.length > 0 ? `(${selectedMembers.length})` : ''}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Sélectionnez un ou plusieurs utilisateurs à ajouter comme membres de l'équipe.
        </p>
        
        {/* Sélection multiple des membres */}
        <MultiSelect
          options={userOptions}
          selectedValues={selectedMembers}
          onChange={setSelectedMembers}
          placeholder="Rechercher des utilisateurs..."
          noOptionsMessage={isLoadingUsers ? "Chargement des utilisateurs..." : "Aucun utilisateur disponible"}
          label="Nouveaux membres"
          tagsPosition="below"
        />
        
        {/* Message informatif */}
        {userOptions.length === 0 && !isLoadingUsers && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            Tous les utilisateurs disponibles font déjà partie de cette équipe.
          </div>
        )}
        
        {selectedMembers.length > 0 && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
            {selectedMembers.length} utilisateur{selectedMembers.length > 1 ? 's' : ''} sélectionné{selectedMembers.length > 1 ? 's' : ''}.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddTeamMembersModal;