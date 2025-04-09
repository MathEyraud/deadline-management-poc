/**
 * Layout pour toutes les pages du dashboard dans App Router
 * Ce layout est partagé entre toutes les pages sous /dashboard/*
 * Il utilise le composant DashboardLayout qui contient la logique de mise en page
 * @module app/dashboard/layout
 */
'use client';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Layout pour les routes protégées du dashboard
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu des pages
 * @returns {JSX.Element} Layout avec Navbar, Sidebar, etc.
 */
export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Utilise le composant DashboardLayout qui contient la logique et l'UI
  return <DashboardLayout>{children}</DashboardLayout>;
}