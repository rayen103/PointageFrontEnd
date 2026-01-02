import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressBarModule
  ],
  templateUrl: './report-export.component.html'
})
export class ReportExportComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  exportForm: FormGroup;
  exporting = signal(false);

  constructor() {
    this.exportForm = this.fb.group({
      reportType: ['', Validators.required],
      format: ['pdf', Validators.required],
      startDate: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), Validators.required],
      endDate: [new Date(), Validators.required],
      service: [''],
      department: ['']
    });
  }

  exportReport(): void {
    if (this.exportForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
      return;
    }

    const formValue = this.exportForm.value;
    this.exporting.set(true);

    // Simulate export process
    setTimeout(() => {
      this.exporting.set(false);
      const formatName = this.getFormatName(formValue.format);
      const reportName = this.getReportName(formValue.reportType);
      this.snackBar.open(`${reportName} exporté en ${formatName} avec succès!`, 'Fermer', { duration: 5000 });

      // In real implementation, trigger file download here
      this.downloadFile(formValue);
    }, 2000);
  }

  downloadFile(formValue: any): void {
    // Mock download - In production, this would trigger actual file download
    const filename = `rapport_${formValue.reportType}_${Date.now()}.${formValue.format === 'excel' ? 'xlsx' : formValue.format}`;
    console.log('Downloading:', filename, formValue);
  }

  getFormatName(format: string): string {
    const formats: Record<string, string> = {
      pdf: 'PDF',
      excel: 'Excel',
      csv: 'CSV'
    };
    return formats[format] || format;
  }

  getReportName(type: string): string {
    const reports: Record<string, string> = {
      presence: 'Rapport de Présence',
      department: 'Rapport par Département',
      overtime: 'Rapport des Heures Supplémentaires',
      delay: 'Rapport des Retards',
      leave: 'Rapport des Congés'
    };
    return reports[type] || type;
  }

  resetForm(): void {
    this.exportForm.reset({
      format: 'pdf',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    });
    this.snackBar.open('Formulaire réinitialisé', 'Fermer', { duration: 2000 });
  }
}
