import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-report-selection',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './report-selection.component.html'
})
export class ReportSelectionComponent {
  private router = inject(Router);

  reportTypes = signal<ReportType[]>([
    {
      id: 'presence',
      title: 'Rapport de Présence',
      description: 'Présence détaillée par employé avec filtres par période',
      icon: 'people',
      color: 'primary'
    },
    {
      id: 'department',
      title: 'Rapport par Département',
      description: 'Comparaisons et statistiques par département',
      icon: 'business',
      color: 'success'
    },
    {
      id: 'overtime',
      title: 'Rapport Heures Supplémentaires',
      description: 'Détails des heures supplémentaires avec répartition par taux',
      icon: 'schedule',
      color: 'warning'
    },
    {
      id: 'delays',
      title: 'Rapport Retards',
      description: 'Tendances des retards avec analyses et justifications',
      icon: 'access_time',
      color: 'danger'
    },
    {
      id: 'leaves',
      title: 'Rapport Congés',
      description: 'Soldes de congés et historique des demandes',
      icon: 'event_busy',
      color: 'info'
    }
  ]);

  selectReport(report: ReportType): void {
    console.log('Selected report:', report.id);
    // Navigation to specific report component would go here
  }
}
