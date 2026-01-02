import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { ImportService } from '../../services/import.service';

interface ImportRecord {
  deviceId: string;
  matricule: string;
  nomPrenom: string;
  dateTime: Date;
  type: 'E' | 'S';
  status: 'pending' | 'success' | 'error' | 'duplicate';
  errorMessage?: string;
}

interface ImportSummary {
  total: number;
  success: number;
  errors: number;
  duplicates: number;
}

@Component({
  selector: 'app-import-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: './import-attendance.component.html'
})
export class ImportAttendanceComponent implements OnInit {
  private importService = inject(ImportService);

  // Signals
  loading = signal(false);
  error = signal<string | null>(null);
  records = signal<ImportRecord[]>([]);
  summary = signal<ImportSummary>({ total: 0, success: 0, errors: 0, duplicates: 0 });
  
  // Form fields
  selectedFile: File | null = null;
  dateDebut: string = '';
  dateFin: string = '';
  selectedDevices: string[] = [];
  
  // Import source options
  importSource: 'file' | 'device' | 'text' = 'file';
  fileType: 'excel' | 'csv' | 'access' = 'csv';
  
  // Available devices (would come from device service)
  availableDevices = [
    { id: 'DEV001', name: 'Pointeuse Entrée' },
    { id: 'DEV002', name: 'Pointeuse Bureau' },
    { id: 'DEV003', name: 'Pointeuse Atelier' }
  ];

  ngOnInit(): void {
    // Set default date range (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    this.dateFin = this.formatDate(today);
    this.dateDebut = this.formatDate(weekAgo);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.error.set(null);
    }
  }

  onDeviceToggle(deviceId: string): void {
    const index = this.selectedDevices.indexOf(deviceId);
    if (index > -1) {
      this.selectedDevices.splice(index, 1);
    } else {
      this.selectedDevices.push(deviceId);
    }
  }

  async importFromFile(): Promise<void> {
    if (!this.selectedFile) {
      this.error.set('Veuillez sélectionner un fichier');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      // Read file content
      const fileContent = await this.importService.fileToText(this.selectedFile);
      
      // TODO: Replace hardcoded value with user session data
      const request = {
        codeSociete: 'SOC001', // TODO: Get from user session
        fileContent: fileContent,
        fileType: this.fileType,
        fileName: this.selectedFile.name
      };

      // Import via backend API
      const result = await firstValueFrom(this.importService.importFromFile(request));
      
      // Convert result to display format
      const displayRecords: ImportRecord[] = result.recordResults.map(r => ({
        deviceId: r.deviceId || '',
        matricule: r.matricule,
        nomPrenom: r.nomPrenom || '',
        dateTime: new Date(r.dateTime),
        type: r.type as 'E' | 'S',
        status: r.status as 'pending' | 'success' | 'error' | 'duplicate',
        errorMessage: r.errorMessage
      }));

      this.records.set(displayRecords);
      this.summary.set({
        total: result.totalRecords,
        success: result.successCount,
        errors: result.errorCount,
        duplicates: result.duplicateCount
      });

      if (result.success) {
        alert(`Import réussi: ${result.successCount} enregistrements importés`);
      } else {
        this.error.set(result.message);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Erreur lors de l\'importation');
    } finally {
      this.loading.set(false);
    }
  }

  async importFromDevices(): Promise<void> {
    if (this.selectedDevices.length === 0) {
      this.error.set('Veuillez sélectionner au moins une pointeuse');
      return;
    }

    if (!this.dateDebut || !this.dateFin) {
      this.error.set('Veuillez spécifier la période');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      // TODO: Replace hardcoded value with user session data
      const request = {
        codeSociete: 'SOC001', // TODO: Get from user session
        deviceIds: this.selectedDevices,
        dateDebut: this.dateDebut,
        dateFin: this.dateFin
      };

      const result = await firstValueFrom(this.importService.importFromDevices(request));
      
      if (!result.success) {
        this.error.set(result.message);
        return;
      }

      // Convert result to display format
      const displayRecords: ImportRecord[] = result.recordResults.map(r => ({
        deviceId: r.deviceId || '',
        matricule: r.matricule,
        nomPrenom: r.nomPrenom || '',
        dateTime: new Date(r.dateTime),
        type: r.type as 'E' | 'S',
        status: r.status as 'pending' | 'success' | 'error' | 'duplicate',
        errorMessage: r.errorMessage
      }));

      this.records.set(displayRecords);
      this.summary.set({
        total: result.totalRecords,
        success: result.successCount,
        errors: result.errorCount,
        duplicates: result.duplicateCount
      });
    } catch (err: any) {
      this.error.set(err.message || 'Erreur lors de l\'importation');
    } finally {
      this.loading.set(false);
    }
  }

  clearImport(): void {
    this.records.set([]);
    this.summary.set({ total: 0, success: 0, errors: 0, duplicates: 0 });
    this.selectedFile = null;
    this.error.set(null);
  }

  exportErrors(): void {
    const errorRecords = this.records().filter(r => r.status === 'error');
    if (errorRecords.length === 0) {
      alert('Aucune erreur à exporter');
      return;
    }

    // Create CSV of errors
    let csv = 'Matricule,Nom,Date/Heure,Type,Erreur\n';
    for (const record of errorRecords) {
      csv += `${record.matricule},${record.nomPrenom},${record.dateTime.toLocaleString()},${record.type},${record.errorMessage}\n`;
    }

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'duplicate': return '⚠';
      default: return '○';
    }
  }
}
