import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProblematicEmployee {
  matricule: string;
  nom: string;
  prenom: string;
  problemType: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  resolved: boolean;
}

@Component({
  selector: 'app-problematic-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './problematic-employees.component.html',
})
export class ProblematicEmployeesComponent {
  employees = signal<ProblematicEmployee[]>([]);
  loading = signal(false);
  filterSeverity = signal('all');
  filterResolved = signal('pending');

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.loading.set(true);
    // Simulated data
    setTimeout(() => {
      this.employees.set([
        {
          matricule: 'EMP001',
          nom: 'Dupont',
          prenom: 'Jean',
          problemType: 'Heures manquantes',
          description: 'Plusieurs jours sans pointage',
          severity: 'high',
          date: new Date('2024-01-15'),
          resolved: false
        },
        {
          matricule: 'EMP005',
          nom: 'Martin',
          prenom: 'Sophie',
          problemType: 'Retards fréquents',
          description: 'Plus de 5 retards ce mois',
          severity: 'medium',
          date: new Date('2024-01-18'),
          resolved: false
        },
        {
          matricule: 'EMP010',
          nom: 'Bernard',
          prenom: 'Luc',
          problemType: 'Horaire invalide',
          description: 'Heures de sortie avant heures d\'entrée',
          severity: 'high',
          date: new Date('2024-01-20'),
          resolved: true
        }
      ]);
      this.loading.set(false);
    }, 500);
  }

  filteredEmployees() {
    return this.employees().filter(emp => {
      const matchesSeverity = this.filterSeverity() === 'all' || emp.severity === this.filterSeverity();
      const matchesResolved = this.filterResolved() === 'all' ||
        (this.filterResolved() === 'pending' && !emp.resolved) ||
        (this.filterResolved() === 'resolved' && emp.resolved);
      return matchesSeverity && matchesResolved;
    });
  }

  markResolved(employee: ProblematicEmployee): void {
    employee.resolved = true;
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return severity;
    }
  }

  pendingCount(): number {
    return this.employees().filter(emp => !emp.resolved).length;
  }

  resolvedCount(): number {
    return this.employees().filter(emp => emp.resolved).length;
  }
}
