/**
 * Composant Badge personnalisé
 * Étiquette colorée pour afficher des statuts ou catégories
 * @module components/ui/Badge
 */
import { VariantProps, cva } from 'class-variance-authority';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Définition des variantes du badge
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-slate-200 text-slate-800",
        primary: "bg-blue-100 text-blue-800",
        secondary: "bg-slate-100 text-slate-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        danger: "bg-red-100 text-red-800",
        outline: "border border-slate-200 text-slate-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props pour le composant Badge
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Composant Badge personnalisé
 * @param props - Propriétés du badge
 * @returns Composant Badge
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };