/**
 * Composant d'analyse prédictive pour une échéance
 * Affiche la probabilité de complétion, les facteurs de risque et les recommandations
 * @module components/deadline/DeadlinePrediction
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { useAIPrediction } from '@/hooks/useAIPrediction';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Props pour le composant DeadlinePrediction
 */
interface DeadlinePredictionProps {
  /** ID de l'échéance à analyser */
  deadlineId: string;
  
  /** Récupérer automatiquement la prédiction au chargement */
  autoFetch?: boolean;
}

/**
 * Composant qui affiche l'analyse prédictive d'une échéance
 * @param props - Propriétés du composant
 * @returns Composant d'analyse prédictive
 */
export const DeadlinePrediction: React.FC<DeadlinePredictionProps> = ({ 
  deadlineId, 
  autoFetch = false 
}) => {
  // Utiliser le hook de prédiction
  const { prediction, isLoading, error, getPrediction } = useAIPrediction(deadlineId, autoFetch);
  
  // Formater le pourcentage de probabilité
  const formattedProbability = prediction ? 
    `${Math.round(prediction.completion_probability * 100)}%` : 
    'N/A';
  
  /**
   * Détermine la classe de couleur basée sur la probabilité
   * @param prob - Probabilité entre 0 et 1
   * @returns Classe CSS pour la couleur
   */
  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return 'text-green-600';
    if (prob >= 0.4) return 'text-amber-500';
    return 'text-red-600';
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Analyse IA</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => getPrediction()} 
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 text-center bg-red-50 rounded-md text-red-600">
            <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
            <p>Service d'analyse IA indisponible</p>
            <p className="text-sm">Veuillez réessayer ultérieurement</p>
          </div>
        ) : isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-slate-500">Analyse en cours...</p>
          </div>
        ) : prediction ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-500 mb-1">Probabilité de complétion</h3>
              <p className={`text-3xl font-bold ${getProbabilityColor(prediction.completion_probability)}`}>
                {formattedProbability}
              </p>
            </div>
            
            {prediction.risk_factors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Facteurs de risque</h3>
                <div className="flex flex-wrap gap-2">
                  {prediction.risk_factors.map((factor, index) => (
                    <Badge key={index} variant="warning">{factor}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {prediction.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Recommandations</h3>
                <ul className="space-y-1 list-disc list-inside text-slate-700">
                  {prediction.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-xs text-slate-400 text-right mt-2">
              Traitement: {prediction.processing_time.toFixed(2)}s
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <Button onClick={() => getPrediction()}>
              Obtenir des recommandations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadlinePrediction;