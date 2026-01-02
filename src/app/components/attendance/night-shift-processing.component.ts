import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NightShiftService,
  NightShiftHours,
  NightShiftProcessRequest,
  NightShiftReport
} from '../../services/night-shift.service';

@Component({
  selector: 'app-night-shift-processing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
  ],
  templateUrl: './night-shift-processing.component.html',
})
export class NightShiftProcessingComponent implements OnInit {
  private nightShiftService = inject(NightShiftService);

  nightShiftData = signal<NightShiftHours[]>([]);
  report = signal<NightShiftReport | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  premiumRate = signal<number>(0);

  // Form data
  codeSociete = signal('DEFAULT');
  dateDebut = signal(new Date().toISOString().split('T')[0]);
  dateFin = signal(new Date().toISOString().split('T')[0]);
  matricule = signal('');
  calculatePremiums = signal(true);

  // Computed properties
  totalEmployees = computed(() => this.nightShiftData().length);
  totalNightHours = computed(() => 
    this.nightShiftData().reduce((sum, emp) => sum + emp.totalNightHours, 0)
  );
  totalPremiumAmount = computed(() => 
    this.nightShiftData().reduce((sum, emp) => sum + emp.nightPremiumAmount, 0)
  );

  ngOnInit(): void {
    this.loadPremiumRate();
  }

  loadPremiumRate(): void {
    this.nightShiftService.getPremiumRate(this.codeSociete()).subscribe({
      next: (response) => {
        this.premiumRate.set(response.rate);
      },
      error: (err) => {
        console.error('Error loading premium rate:', err);
        this.premiumRate.set(0.25); // Default 25%
      }
    });
  }

  calculateNightHours(): void {
    this.loading.set(true);
    this.error.set(null);

    const request: NightShiftProcessRequest = {
      codeSociete: this.codeSociete(),
      dateDebut: this.dateDebut(),
      dateFin: this.dateFin(),
      matricule: this.matricule() || undefined,
      calculatePremiums: this.calculatePremiums()
    };

    this.nightShiftService.calculateNightHours(request).subscribe({
      next: (data) => {
        this.nightShiftData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du calcul des heures de nuit: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  generateReport(): void {
    this.loading.set(true);
    this.error.set(null);

    const request: NightShiftProcessRequest = {
      codeSociete: this.codeSociete(),
      dateDebut: this.dateDebut(),
      dateFin: this.dateFin(),
      matricule: this.matricule() || undefined,
      calculatePremiums: this.calculatePremiums()
    };

    this.nightShiftService.generateReport(request).subscribe({
      next: (reportData) => {
        this.report.set(reportData);
        this.nightShiftData.set(reportData.employeeDetails);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors de la génération du rapport: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }

  getNightPeriodsTooltip(employee: NightShiftHours): string {
    if (!employee.nightPeriods || employee.nightPeriods.length === 0) {
      return 'Aucune période de nuit';
    }
    return employee.nightPeriods
      .map(p => `${p.startTime} - ${p.endTime}: ${this.formatHours(p.hours)}`)
      .join('\n');
  }

  adjustNightHours(employee: NightShiftHours): void {
    // This would open a dialog for adjustment
    // For now, we'll just log it
    console.log('Adjust night hours for:', employee.matricule);
  }

  exportToExcel(): void {
    // Export functionality would be implemented here
    console.log('Export to Excel');
  }

  clearFilters(): void {
    this.matricule.set('');
    this.dateDebut.set(new Date().toISOString().split('T')[0]);
    this.dateFin.set(new Date().toISOString().split('T')[0]);
    this.nightShiftData.set([]);
    this.report.set(null);
  }
}
