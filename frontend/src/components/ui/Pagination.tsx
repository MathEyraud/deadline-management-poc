/**
 * Composant Pagination
 * Interface de pagination pour les tableaux et listes
 * @module components/ui/Pagination
 */
import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Props pour le composant Pagination
 */
interface PaginationProps {
  /** Page actuelle */
  currentPage: number;
  /** Nombre total de pages */
  totalPages: number;
  /** Fonction appelée lors du changement de page */
  onPageChange: (page: number) => void;
  /** Nombre de pages à afficher de chaque côté de la page courante */
  siblingCount?: number;
}

/**
 * Composant Pagination - Interface de navigation entre les pages
 * @param props - Propriétés du composant
 * @returns Composant Pagination
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1
}: PaginationProps) {
  // Génère un tableau de pages à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Toujours inclure la première page
    pageNumbers.push(1);
    
    // Pages avant la page courante
    for (let i = Math.max(2, currentPage - siblingCount); i < currentPage; i++) {
      pageNumbers.push(i);
    }
    
    // Page courante
    if (currentPage !== 1 && currentPage !== totalPages) {
      pageNumbers.push(currentPage);
    }
    
    // Pages après la page courante
    for (let i = currentPage + 1; i <= Math.min(totalPages - 1, currentPage + siblingCount); i++) {
      pageNumbers.push(i);
    }
    
    // Toujours inclure la dernière page si elle existe
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Ajouter des ellipses si nécessaire
    const result = [];
    let prevPage = 0;
    
    for (const page of pageNumbers) {
      if (prevPage && page - prevPage > 1) {
        result.push(-prevPage); // Utiliser un nombre négatif pour représenter une ellipse après prevPage
      }
      result.push(page);
      prevPage = page;
    }
    
    return result;
  };
  
  // Pas de pagination si une seule page
  if (totalPages <= 1) {
    return null;
  }
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-500">
        Page {currentPage} sur {totalPages}
      </div>
      
      <div className="flex items-center space-x-1">
        {/* Première page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Page précédente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Numéros de page */}
        {pageNumbers.map((pageNumber, index) => (
          pageNumber < 0 ? (
            // Ellipse
            <span key={`ellipsis-${index}`} className="px-2">...</span>
          ) : (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className="min-w-[32px]"
            >
              {pageNumber}
            </Button>
          )
        ))}
        
        {/* Page suivante */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Dernière page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}