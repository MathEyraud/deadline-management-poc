"""
Module de traitement des données pour le service IA
--------------------------------------------------
Ce module fournit des fonctions pour prétraiter et analyser
les données d'échéances afin d'améliorer les capacités prédictives.
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel

# Configuration du logging
logger = logging.getLogger("data_processing")

# Modèles Pydantic pour la validation des données
class DeadlineInfo(BaseModel):
    """Information sur une échéance"""
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    deadlineDate: datetime
    status: str
    priority: str
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    
    class Config:
        """Configuration pour la conversion datetime/json"""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Fonctions d'extraction et de transformation des caractéristiques

def extract_deadline_features(deadline: DeadlineInfo) -> Dict[str, Any]:
    """
    Extrait les caractéristiques importantes d'une échéance pour l'analyse.
    
    Args:
        deadline: L'échéance à analyser
        
    Returns:
        Dictionnaire des caractéristiques extraites
    """
    now = datetime.now()
    deadline_date = deadline.deadlineDate
    
    # Calcul des caractéristiques temporelles
    days_until_deadline = (deadline_date - now).total_seconds() / (24 * 3600)
    is_overdue = days_until_deadline < 0
    
    # Normalisation de la priorité
    priority_map = {
        "critique": 4,
        "haute": 3,
        "moyenne": 2,
        "basse": 1
    }
    priority_value = priority_map.get(deadline.priority.lower(), 2)
    
    # Normalisation du statut
    status_progress_map = {
        "nouvelle": 0.0,
        "en cours": 0.5,
        "en attente": 0.3,
        "complétée": 1.0,
        "annulée": -1.0
    }
    status_progress = status_progress_map.get(deadline.status.lower(), 0.0)
    
    # Extraction de caractéristiques textuelles basiques
    has_description = 1 if deadline.description and len(deadline.description) > 10 else 0
    title_word_count = len(deadline.title.split())
    
    # Construction du vecteur de caractéristiques
    features = {
        "days_until_deadline": days_until_deadline,
        "is_overdue": int(is_overdue),
        "priority_value": priority_value,
        "status_progress": status_progress,
        "has_description": has_description,
        "title_word_count": title_word_count,
        "is_weekend_deadline": 1 if deadline_date.weekday() >= 5 else 0,
        "hour_of_deadline": deadline_date.hour,
    }
    
    return features

def enrich_deadlines_with_features(deadlines: List[DeadlineInfo]) -> List[Dict[str, Any]]:
    """
    Enrichit une liste d'échéances avec des caractéristiques calculées.
    
    Args:
        deadlines: Liste des échéances à enrichir
        
    Returns:
        Liste des échéances avec caractéristiques enrichies
    """
    enriched_deadlines = []
    
    for deadline in deadlines:
        # Extraire les données de base
        deadline_dict = deadline.dict()
        
        # Ajouter les caractéristiques calculées
        features = extract_deadline_features(deadline)
        deadline_dict["features"] = features
        
        # Ajouter quelques métadonnées supplémentaires
        deadline_dict["days_left"] = features["days_until_deadline"]
        deadline_dict["completion_status"] = features["status_progress"] * 100
        
        enriched_deadlines.append(deadline_dict)
    
    return enriched_deadlines

def compute_deadline_stats(deadlines: List[DeadlineInfo]) -> Dict[str, Any]:
    """
    Calcule des statistiques sur un ensemble d'échéances.
    
    Args:
        deadlines: Liste des échéances
        
    Returns:
        Dictionnaire de statistiques sur les échéances
    """
    if not deadlines:
        return {
            "count": 0,
            "overdue_count": 0,
            "overdue_percentage": 0,
            "avg_days_left": 0,
            "priority_distribution": {},
            "status_distribution": {}
        }
    
    now = datetime.now()
    
    # Calcul des statistiques de base
    total = len(deadlines)
    overdue = sum(1 for d in deadlines if d.deadlineDate < now)
    overdue_percentage = (overdue / total) * 100 if total > 0 else 0
    
    days_left = [(d.deadlineDate - now).total_seconds() / (24 * 3600) for d in deadlines]
    avg_days_left = sum(days_left) / total if total > 0 else 0
    
    # Distribution des priorités
    priorities = [d.priority.lower() for d in deadlines]
    priority_counts = {}
    for p in priorities:
        priority_counts[p] = priority_counts.get(p, 0) + 1
    
    priority_distribution = {k: (v / total) * 100 for k, v in priority_counts.items()}
    
    # Distribution des statuts
    statuses = [d.status.lower() for d in deadlines]
    status_counts = {}
    for s in statuses:
        status_counts[s] = status_counts.get(s, 0) + 1
    
    status_distribution = {k: (v / total) * 100 for k, v in status_counts.items()}
    
    return {
        "count": total,
        "overdue_count": overdue,
        "overdue_percentage": overdue_percentage,
        "avg_days_left": avg_days_left,
        "priority_distribution": priority_distribution,
        "status_distribution": status_distribution
    }

def estimate_completion_probability(
    deadline: DeadlineInfo, 
    historical_data: Optional[List[DeadlineInfo]] = None
) -> float:
    """
    Estime la probabilité de complétion d'une échéance dans les délais
    en se basant sur ses caractéristiques et des données historiques.
    
    Cette fonction utilise un modèle heuristique simplifié.
    En production, elle pourrait être remplacée par un modèle ML entraîné.
    
    Args:
        deadline: L'échéance à évaluer
        historical_data: Données historiques pour comparaison
        
    Returns:
        Probabilité de complétion entre 0 et 1
    """
    # Extraction des caractéristiques
    features = extract_deadline_features(deadline)
    
    # Base de probabilité selon le temps restant
    days_left = features["days_until_deadline"]
    
    if days_left < 0:  # Déjà en retard
        base_probability = 0.1  # Faible chance mais pas impossible
    elif days_left < 1:  # Moins d'un jour
        base_probability = 0.4
    elif days_left < 3:  # 1-3 jours
        base_probability = 0.6
    elif days_left < 7:  # 3-7 jours
        base_probability = 0.75
    else:  # Plus d'une semaine
        base_probability = 0.85
    
    # Ajustement selon la priorité
    priority_adjustment = {
        1: 0,      # basse
        2: 0.05,   # moyenne
        3: 0.1,    # haute
        4: 0.15    # critique
    }
    
    # Ajustement selon le progrès du statut
    status_adjustment = {
        0.0: 0,     # nouvelle
        0.3: 0.1,   # en attente
        0.5: 0.3,   # en cours
        1.0: 0.5    # complétée (devrait être 1.0 mais gardons une marge)
    }
    
    # Appliquer les ajustements
    probability = base_probability
    probability += priority_adjustment.get(features["priority_value"], 0)
    probability += status_adjustment.get(features["status_progress"], 0)
    
    # Ajustement pour les échéances le weekend
    if features["is_weekend_deadline"]:
        probability -= 0.05
    
    # Si nous avons des données historiques, ajustons en fonction des tendances
    if historical_data and len(historical_data) > 0:
        # Calculer le taux de complétion historique
        completed = sum(1 for d in historical_data if d.status.lower() in ["complétée", "terminée"])
        historical_rate = completed / len(historical_data)
        
        # Ajuster la probabilité en tenant compte de l'historique (poids: 30%)
        probability = 0.7 * probability + 0.3 * historical_rate
    
    # Assurer que la probabilité reste dans [0, 1]
    probability = max(0, min(1, probability))
    
    return probability

def analyze_deadline_risks(
    deadline: DeadlineInfo, 
    historical_data: Optional[List[DeadlineInfo]] = None
) -> List[Dict[str, Any]]:
    """
    Analyse les risques associés à une échéance.
    
    Args:
        deadline: L'échéance à analyser
        historical_data: Données historiques pour comparaison
        
    Returns:
        Liste des facteurs de risque identifiés
    """
    features = extract_deadline_features(deadline)
    risks = []
    
    # Risque lié au temps
    days_left = features["days_until_deadline"]
    if days_left < 0:
        risks.append({
            "factor": "Échéance dépassée",
            "impact": "critical",
            "description": f"L'échéance est déjà dépassée de {abs(int(days_left))} jours."
        })
    elif days_left < 1:
        risks.append({
            "factor": "Délai imminent",
            "impact": "high",
            "description": "Moins de 24 heures avant l'échéance."
        })
    elif days_left < 3:
        risks.append({
            "factor": "Délai court",
            "impact": "medium",
            "description": f"Seulement {int(days_left)} jours avant l'échéance."
        })
    
    # Risque lié à la priorité et au statut
    if features["priority_value"] >= 3 and features["status_progress"] < 0.5:
        risks.append({
            "factor": "Tâche haute priorité peu avancée",
            "impact": "high",
            "description": "Échéance de haute priorité avec peu de progrès."
        })
    
    # Risque lié au jour de la semaine
    if features["is_weekend_deadline"]:
        risks.append({
            "factor": "Échéance en weekend",
            "impact": "low",
            "description": "L'échéance tombe pendant un weekend, ce qui peut compliquer la finalisation."
        })
    
    # Risque lié à l'heure
    if features["hour_of_deadline"] < 9 or features["hour_of_deadline"] > 17:
        risks.append({
            "factor": "Échéance hors heures de bureau",
            "impact": "low",
            "description": "L'échéance est fixée en dehors des heures normales de travail."
        })
    
    # Risques basés sur l'historique
    if historical_data and len(historical_data) >= 3:
        similar_missed = [d for d in historical_data if d.status.lower() not in ["complétée", "terminée"]]
        missed_rate = len(similar_missed) / len(historical_data)
        
        if missed_rate > 0.5:
            risks.append({
                "factor": "Historique défavorable",
                "impact": "medium",
                "description": f"Historiquement, {int(missed_rate*100)}% des échéances similaires n'ont pas été complétées dans les délais."
            })
    
    return risks

def generate_deadline_recommendations(
    deadline: DeadlineInfo,
    risks: List[Dict[str, Any]]
) -> List[str]:
    """
    Génère des recommandations pour améliorer les chances de complétion d'une échéance.
    
    Args:
        deadline: L'échéance concernée
        risks: Liste des risques identifiés
        
    Returns:
        Liste de recommandations
    """
    features = extract_deadline_features(deadline)
    recommendations = []
    
    # Recommandations basées sur le temps restant
    days_left = features["days_until_deadline"]
    if days_left < 0:
        recommendations.append("Redéfinir l'échéance avec une nouvelle date réaliste")
        recommendations.append("Communiquer immédiatement avec les parties prenantes concernant le retard")
    elif days_left < 1:
        recommendations.append("Concentrer tous les efforts sur cette tâche en priorité")
        recommendations.append("Éliminer toutes les distractions et réunions non essentielles")
    elif days_left < 3:
        recommendations.append("Allouer un bloc de temps dédié chaque jour à cette tâche")
        recommendations.append("Identifier et résoudre rapidement les blocages potentiels")
    
    # Recommandations basées sur le statut
    if features["status_progress"] < 0.3:
        recommendations.append("Décomposer l'échéance en sous-tâches plus petites et gérables")
        recommendations.append("Définir des jalons intermédiaires pour suivre la progression")
    
    # Recommandations basées sur la priorité
    if features["priority_value"] >= 3:
        recommendations.append("Envisager de déléguer d'autres tâches moins prioritaires")
        recommendations.append("Solliciter des ressources supplémentaires si nécessaire")
    
    # Recommandations basées sur les risques identifiés
    for risk in risks:
        if risk["factor"] == "Échéance en weekend":
            recommendations.append("Planifier l'achèvement pour le vendredi précédent")
        elif risk["factor"] == "Historique défavorable":
            recommendations.append("Analyser les causes d'échecs précédents pour éviter les mêmes erreurs")
        elif risk["factor"] == "Tâche haute priorité peu avancée":
            recommendations.append("Organiser une session de travail intensif (type 'sprint') sur cette tâche")
    
    # Recommandations générales si la liste est encore courte
    if len(recommendations) < 3:
        recommendations.append("Mettre en place des points de contrôle réguliers pour suivre l'avancement")
        recommendations.append("Documenter les progrès et les obstacles rencontrés")
        recommendations.append("Maintenir une communication claire avec toutes les parties prenantes")
    
    return recommendations[:5]  # Limiter à 5 recommandations pour éviter la surcharge

# Fonction principale d'analyse complète

def analyze_deadline(
    deadline: DeadlineInfo, 
    historical_data: Optional[List[DeadlineInfo]] = None
) -> Dict[str, Any]:
    """
    Réalise une analyse complète d'une échéance.
    
    Args:
        deadline: L'échéance à analyser
        historical_data: Données historiques pour comparaison
        
    Returns:
        Résultats d'analyse complets
    """
    try:
        # Extraire les caractéristiques
        features = extract_deadline_features(deadline)
        
        # Estimer la probabilité de complétion
        probability = estimate_completion_probability(deadline, historical_data)
        
        # Analyser les risques
        risks = analyze_deadline_risks(deadline, historical_data)
        
        # Générer des recommandations
        recommendations = generate_deadline_recommendations(deadline, risks)
        
        # Calculer des statistiques sur les données historiques, si disponibles
        historical_stats = compute_deadline_stats(historical_data) if historical_data else None
        
        # Assembler les résultats
        results = {
            "deadline_info": deadline.dict(),
            "features": features,
            "completion_probability": probability,
            "risk_factors": risks,
            "recommendations": recommendations
        }
        
        if historical_stats:
            results["historical_stats"] = historical_stats
        
        return results
    
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse de l'échéance: {e}")
        # Retourner une analyse minimale en cas d'erreur
        return {
            "deadline_info": deadline.dict(),
            "completion_probability": 0.5,
            "risk_factors": [{"factor": "Erreur d'analyse", "impact": "medium"}],
            "recommendations": ["Vérifier les données de l'échéance"]
        }

# Point d'entrée pour les tests
if __name__ == "__main__":
    # Exemple d'utilisation
    now = datetime.now()
    
    # Créer une échéance de test
    test_deadline = DeadlineInfo(
        id="test-123",
        title="Test d'analyse",
        description="Description de test pour l'analyse",
        deadlineDate=now + timedelta(days=2),
        status="en cours",
        priority="haute",
        projectName="Projet Test"
    )
    
    # Analyser l'échéance
    results = analyze_deadline(test_deadline)
    
    # Afficher les résultats
    import json
    print(json.dumps(results, indent=2, default=str))