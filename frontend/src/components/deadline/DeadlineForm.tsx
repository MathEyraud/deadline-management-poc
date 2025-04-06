import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { DatePicker } from '../ui/DatePicker';

/**
 * Formulaire de création/édition d'une échéance
 * @param {Object} props - Propriétés du composant
 * @param {Object} [props.initialData] - Données initiales pour l'édition d'une échéance existante
 * @returns {JSX.Element} Formulaire d'échéance
 */
export const DeadlineForm = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const { data: projects } = useProjects();
  const { createDeadline, updateDeadline } = useDeadlines();
  
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    deadlineDate: new Date(),
    priority: 'moyenne',
    status: 'nouvelle',
    projectId: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, deadlineDate: date }));
    
    // Clear deadline date error
    if (errors.deadlineDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.deadlineDate;
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.deadlineDate) {
      newErrors.deadlineDate = 'La date d\'échéance est requise';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Le projet est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        // Mise à jour d'une échéance existante
        await updateDeadline(initialData.id, formData);
      } else {
        // Création d'une nouvelle échéance
        await createDeadline(formData);
      }
      
      // Redirection vers la liste des échéances après succès
      router.push('/deadlines');
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      // Gérer l'erreur (affichage notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre*
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Titre de l'échéance"
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description détaillée de l'échéance"
          rows={4}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="deadlineDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date d'échéance*
          </label>
          <DatePicker
            id="deadlineDate"
            name="deadlineDate"
            selected={formData.deadlineDate}
            onChange={handleDateChange}
            error={errors.deadlineDate}
          />
          {errors.deadlineDate && (
            <p className="mt-1 text-sm text-red-600">{errors.deadlineDate}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
            Projet*
          </label>
          <Select
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            error={errors.projectId}
          >
            <option value="">Sélectionner un projet</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          {errors.projectId && (
            <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <Select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="basse">Basse</option>
            <option value="moyenne">Moyenne</option>
            <option value="haute">Haute</option>
          </Select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <Select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="nouvelle">Nouvelle</option>
            <option value="en cours">En cours</option>
            <option value="en attente">En attente</option>
            <option value="terminée">Terminée</option>
            <option value="annulée">Annulée</option>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};
