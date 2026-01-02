import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { PayrollTransferService, EmployeePayrollData as PayrollEmployeeData } from '../../services/payroll-transfer.service';

interface PayrollPeriod {
  dateDebut: Date;
  dateFin: Date;
  selected: boolean;
}

interface EmployeePayrollData {
  matricule: string;
  nomPrenom: string;
  heuresTravaillees: number;
  heuresSupplementaires: number;
  hs1_25: number;
  hs1_5: number;
  hs1_75: number;
  hs2_00: number;
  heuresNuit: number;
  retards: number;
  absences: number;
  conges: number;
  primesPanier: number;
  validated: boolean;
  errors: string[];
}

interface TransferSummary {
  totalEmployees: number;
  totalHeures: number;
  totalHS: number;
  totalRetards: number;
  totalAbsences: number;
  periode: string;
}

@Component({
  selector: 'app-payroll-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './payroll-transfer.component.html'
})
export class PayrollTransferComponent implements OnInit {
  private payrollService = inject(PayrollTransferService);

  // Signals
  loading = signal(false);
  error = signal<string | null>(null);
  employeeData = signal<EmployeePayrollData[]>([]);
  selectedPeriods = signal<PayrollPeriod[]>([]);
  transferCompleted = signal(false);

  // Form inputs
  dateDebut: string = '';
  dateFin: string = '';
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  transferMode: 'monthly' | 'custom' | 'weekly' = 'monthly';

  // Computed
  summary = computed<TransferSummary>(() => {
    const data = this.employeeData();
    return {
      totalEmployees: data.length,
      totalHeures: data.reduce((sum, e) => sum + e.heuresTravaillees, 0),
      totalHS: data.reduce((sum, e) => sum + e.heuresSupplementaires, 0),
      totalRetards: data.reduce((sum, e) => sum + e.retards, 0),
      totalAbsences: data.reduce((sum, e) => sum + e.absences, 0),
      periode: `${this.dateDebut} - ${this.dateFin}`
    };
  });

  validatedCount = computed(() => 
    this.employeeData().filter(e => e.validated).length
  );

  hasErrors = computed(() => 
    this.employeeData().some(e => e.errors.length > 0)
  );

  canTransfer = computed(() => 
    this.employeeData().length > 0 && 
    this.validatedCount() === this.employeeData().length &&
    !this.hasErrors()
  );

  months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' }, { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  ngOnInit(): void {
    this.initializeDefaultPeriod();
  }

  initializeDefaultPeriod(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.dateDebut = this.formatDate(firstDay);
    this.dateFin = this.formatDate(lastDay);
  }

  onTransferModeChange(): void {
    if (this.transferMode === 'monthly') {
      const firstDay = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      const lastDay = new Date(this.selectedYear, this.selectedMonth, 0);
      this.dateDebut = this.formatDate(firstDay);
      this.dateFin = this.formatDate(lastDay);
    }
  }

  onMonthYearChange(): void {
    if (this.transferMode === 'monthly') {
      this.onTransferModeChange();
    }
  }

  async loadPayrollData(): Promise<void> {
    if (!this.dateDebut || !this.dateFin) {
      this.error.set('Veuillez sélectionner une période');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      // Load payroll data from backend
      // TODO: Replace hardcoded values with user session data
      const request = {
        codeSociete: 'SOC001', // TODO: Get from user session
        dateDebut: this.dateDebut,
        dateFin: this.dateFin
      };

      const data = await firstValueFrom(this.payrollService.getPeriodData(request));
      
      if (data) {
        this.employeeData.set(data);
        this.transferCompleted.set(false);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Erreur lors du chargement des données');
    } finally {
      this.loading.set(false);
    }
  }

  validateEmployee(matricule: string): void {
    const data = this.employeeData();
    const employee = data.find(e => e.matricule === matricule);
    if (employee && employee.errors.length === 0) {
      employee.validated = true;
      this.employeeData.set([...data]);
    }
  }

  validateAll(): void {
    const data = this.employeeData();
    data.forEach(e => {
      if (e.errors.length === 0) {
        e.validated = true;
      }
    });
    this.employeeData.set([...data]);
  }

  async transferToPayroll(): Promise<void> {
    if (!this.canTransfer()) {
      this.error.set('Veuillez valider tous les employés avant le transfert');
      return;
    }

    const confirmed = confirm(
      `Confirmer le transfert vers la paie pour ${this.employeeData().length} employés?\n` +
      `Période: ${this.summary().periode}\n` +
      `Cette action est irréversible.`
    );

    if (!confirmed) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      // TODO: Replace hardcoded values with user session data
      const request = {
        codeSociete: 'SOC001', // TODO: Get from user session
        dateDebut: this.dateDebut,
        dateFin: this.dateFin,
        transferredBy: 'CURRENT_USER', // TODO: Get from user session
        comments: `Transfert ${this.transferMode}`
      };

      const result = await firstValueFrom(this.payrollService.executeTransfer(request));
      
      if (result?.success) {
        this.transferCompleted.set(true);
        alert(`Transfert vers la paie effectué avec succès!\nID: ${result.transferId}`);
      } else {
        this.error.set(result?.message || 'Erreur lors du transfert');
      }
    } catch (err: any) {
      this.error.set(err.message || 'Erreur lors du transfert');
    } finally {
      this.loading.set(false);
    }
  }

  async exportToExcel(): Promise<void> {
    try {
      // TODO: Replace hardcoded value with user session data
      const request = {
        codeSociete: 'SOC001', // TODO: Get from user session
        dateDebut: this.dateDebut,
        dateFin: this.dateFin
      };

      const blob = await firstValueFrom(this.payrollService.exportPayrollData(request, 'csv'));
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transfert-paie-${this.dateDebut}-${this.dateFin}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert('Erreur lors de l\'export: ' + (err.message || 'Erreur inconnue'));
    }
  }

  exportErrors(): void {
    const errorsData = this.employeeData().filter(e => e.errors.length > 0);
    if (errorsData.length === 0) {
      alert('Aucune erreur à exporter');
      return;
    }

    let csv = 'Matricule,Nom,Erreurs\n';
    for (const emp of errorsData) {
      csv += `${emp.matricule},${emp.nomPrenom},"${emp.errors.join('; ')}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erreurs-transfert-${this.dateDebut}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  reset(): void {
    this.employeeData.set([]);
    this.transferCompleted.set(false);
    this.error.set(null);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStatusClass(employee: EmployeePayrollData): string {
    if (employee.errors.length > 0) return 'status-error';
    if (employee.validated) return 'status-validated';
    return 'status-pending';
  }

  getStatusIcon(employee: EmployeePayrollData): string {
    if (employee.errors.length > 0) return '⚠️';
    if (employee.validated) return '✅';
    return '⏳';
  }

  getStatusLabel(employee: EmployeePayrollData): string {
    if (employee.errors.length > 0) return 'Erreur';
    if (employee.validated) return 'Validé';
    return 'En attente';
  }
}
