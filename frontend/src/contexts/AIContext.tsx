/**
 * Contexte pour l'état global du service IA
 * @module contexts/AIContext
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { aiService } from '@/lib/api';

/**
 * Interface pour le contexte IA
 */
interface AIContextType {
  /** État de santé du service IA */
  health: { status: string, uptime: number } | null;
  
  /** Vérifie l'état de santé du service IA */
  checkHealth: () => Promise<void>;
  
  /** Indique si une vérification est en cours */
  isChecking: boolean;
}

// Création du contexte
const AIContext = createContext<AIContextType | undefined>(undefined);

/**
 * Fournisseur du contexte IA
 */
export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<{ status: string, uptime: number } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  /**
   * Vérifie l'état de santé du service IA
   */
  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const healthData = await aiService.checkAIHealth();
      setHealth(healthData);
    } catch (err) {
      console.warn('Service IA indisponible:', err);
      setHealth(null);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Vérifier l'état au montage et toutes les 5 minutes
  useEffect(() => {
    checkHealth();
    
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AIContext.Provider value={{ health, checkHealth, isChecking }}>
      {children}
    </AIContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte IA
 * @returns Contexte IA
 */
export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};