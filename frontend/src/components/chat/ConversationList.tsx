/**
 * Composant pour afficher la liste des conversations
 * @module components/chat/ConversationList
 */
import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Edit, 
  MessageSquare, 
  MoreVertical, 
  Plus, 
  Trash2,
  Filter
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Modal, 
  Input
} from '@/components/ui';
import { useConversationsList, useConversationMutations } from '@/hooks/useConversations';
import { formatDate } from '@/lib/utils';

/**
 * Props pour le composant ConversationList
 */
interface ConversationListProps {
  /** ID de la conversation active */
  activeConversationId: string | null;
  
  /** Fonction appelée lorsqu'une conversation est sélectionnée */
  onSelectConversation: (conversationId: string) => void;
  
  /** Fonction appelée lorsqu'une nouvelle conversation est créée */
  onNewConversation: () => void;
  
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant pour afficher la liste des conversations
 * @param props - Propriétés du composant
 * @returns Composant ConversationList
 */
const ConversationList: React.FC<ConversationListProps> = ({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  className = ''
}) => {
  // États pour les filtres
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
  // État pour gérer l'ouverture des menus
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Récupérer les conversations
  const { data: conversations = [], isLoading } = useConversationsList(!showArchived);
  
  // Récupérer les mutations
  const {
    createConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    isCreating,
    isUpdating,
    isDeleting,
    isArchiving
  } = useConversationMutations();
  
  // Effet pour fermer le menu lors d'un clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ne fermez pas si l'on clique sur un bouton du menu ou sur le bouton des trois points
      if (!target.closest('.menu-dropdown') && !target.closest('.menu-trigger')) {
        setOpenMenuId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  /**
   * Filtre les conversations en fonction de la recherche
   * @returns Conversations filtrées
   */
  const filteredConversations = conversations.filter(
    conversation => conversation.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  /**
   * Gère la création d'une nouvelle conversation
   */
  const handleCreateConversation = async () => {
    if (!newTitle.trim()) return;
    
    try {
      const conversation = await createConversation(newTitle);
      setIsCreateModalOpen(false);
      setNewTitle('');
      onSelectConversation(conversation.id);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };
  
  /**
   * Gère la mise à jour du titre d'une conversation
   */
  const handleUpdateConversation = async () => {
    if (!selectedConversationId || !newTitle.trim()) return;
    
    try {
      await updateConversation(selectedConversationId, { title: newTitle });
      setIsEditModalOpen(false);
      setSelectedConversationId(null);
      setNewTitle('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
    }
  };
  
  /**
   * Gère la suppression d'une conversation
   */
  const handleDeleteConversation = async () => {
    if (!selectedConversationId) return;
    
    try {
      await deleteConversation(selectedConversationId);
      setIsDeleteModalOpen(false);
      setSelectedConversationId(null);
      
      // Si la conversation supprimée était active, réinitialiser
      if (selectedConversationId === activeConversationId) {
        onNewConversation();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
    }
  };
  
  /**
   * Gère l'archivage d'une conversation
   */
  const handleArchiveConversation = async (id: string) => {
    try {
      await archiveConversation(id);
      
      // Si la conversation archivée était active, réinitialiser
      if (id === activeConversationId) {
        onNewConversation();
      }
    } catch (error) {
      console.error('Erreur lors de l\'archivage de la conversation:', error);
    }
  };
  
  /**
   * Ouvre la modale d'édition pour une conversation
   * @param conversation - Conversation à éditer
   */
  const openEditModal = (id: string, title: string) => {
    setSelectedConversationId(id);
    setNewTitle(title);
    setIsEditModalOpen(true);
  };
  
  /**
   * Ouvre la modale de suppression pour une conversation
   * @param id - ID de la conversation à supprimer
   */
  const openDeleteModal = (id: string) => {
    setSelectedConversationId(id);
    setIsDeleteModalOpen(true);
  };
  
  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>Conversations</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            title={showArchived ? "Masquer les archives" : "Afficher les archives"}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            className="ml-2"
            onClick={() => {
              setNewTitle('');
              setIsCreateModalOpen(true);
            }}
          >
            Nouveau
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center p-6 flex-grow">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-slate-500 flex-grow">
            {searchTerm ? 'Aucune conversation trouvée.' : 'Aucune conversation disponible.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-y-auto flex-grow">
            {filteredConversations.map((conversation) => (
              <li 
                key={conversation.id}
                className={`relative p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                  conversation.id === activeConversationId ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-10">
                    <h3 className="font-medium text-slate-900 truncate">{conversation.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Mise à jour: {formatDate(conversation.updatedAt)}
                    </p>
                    <div className="flex items-center mt-1">
                      <MessageSquare className="h-3 w-3 text-slate-400 mr-1" />
                      <span className="text-xs text-slate-500">
                        {conversation.message_count || conversation.messages?.length || 0} messages
                      </span>
                      {!conversation.isActive && (
                        <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Archivée
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute right-2 top-2 z-20">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 menu-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === conversation.id ? null : conversation.id);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {openMenuId === conversation.id && (
                        <div 
                          className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 menu-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(conversation.id, conversation.title);
                                setOpenMenuId(null);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Renommer
                            </button>
                            
                            {conversation.isActive && (
                              <button
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveConversation(conversation.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archiver
                              </button>
                            )}
                            
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(conversation.id);
                                setOpenMenuId(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      {/* Modale de création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouvelle conversation"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateConversation}
              isLoading={isCreating}
              disabled={!newTitle.trim() || isCreating}
            >
              Créer
            </Button>
          </div>
        }
      >
        <Input
          label="Titre de la conversation"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ex: Planification projet Alpha"
        />
      </Modal>
      
      {/* Modale d'édition */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Renommer la conversation"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateConversation}
              isLoading={isUpdating}
              disabled={!newTitle.trim() || isUpdating}
            >
              Enregistrer
            </Button>
          </div>
        }
      >
        <Input
          label="Nouveau titre"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Titre de la conversation"
        />
      </Modal>
      
      {/* Modale de suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer la conversation"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConversation}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer cette conversation ?
          Cette action est irréversible.
        </p>
      </Modal>
    </Card>
  );
};

export default ConversationList;