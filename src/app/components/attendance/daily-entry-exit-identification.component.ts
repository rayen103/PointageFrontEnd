import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DailyIdentification {
  id: number;
  matricule: string;
  employeeName: string;
  date: string;
  firstEntry?: string;
  lastExit?: string;
  workDuration?: string;
  breakDuration?: string;
  status: 'complete' | 'incomplete' | 'missing' | 'error';
  issues: string[];
}

@Component({
  selector: 'app-daily-entry-exit-identification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-entry-exit-identification.component.html'
})
export class DailyEntryExitIdentificationComponent {
  // Signals for reactive state
  identifications = signal<DailyIdentification[]>([
    {
      id: 1,
      matricule: 'EMP001',
      employeeName: 'Ahmed Benali',
      date: '2025-12-31',
      firstEntry: '08:00',
      lastExit: '17:00',
      workDuration: '09:00',
      breakDuration: '01:00',
      status: 'complete',
      issues: []
    },
    {
      id: 2,
      matricule: 'EMP002',
      employeeName: 'Sara Mansouri',
      date: '2025-12-31',
      firstEntry: '08:30',
      lastExit: undefined,
      workDuration: undefined,
      breakDuration: undefined,
      status: 'incomplete',
      issues: ['Missing exit time']
    },
    {
      id: 3,
      matricule: 'EMP003',
      employeeName: 'Mohamed Alami',
      date: '2025-12-31',
      firstEntry: undefined,
      lastExit: undefined,
      status: 'missing',
      issues: ['No attendance records']
    },
    {
      id: 4,
      matricule: 'EMP004',
      employeeName: 'Fatima Zahra',
      date: '2025-12-31',
      firstEntry: '07:45',
      lastExit: '18:30',
      workDuration: '10:45',
      breakDuration: '01:00',
      status: 'complete',
      issues: []
    },
    {
      id: 5,
      matricule: 'EMP005',
      employeeName: 'Karim El Idrissi',
      date: '2025-12-31',
      firstEntry: '09:15',
      lastExit: '16:45',
      workDuration: '07:30',
      breakDuration: '01:00',
      status: 'error',
      issues: ['Multiple entry/exit pairs detected', 'Possible duplicate records']
    }
  ]);

  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  filterStatus = signal<string>('all');
  searchTerm = signal<string>('');

  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  filteredIdentifications() {
    return this.identifications().filter(ident => {
      const statusMatch = this.filterStatus() === 'all' || ident.status === this.filterStatus();
      const searchMatch = !this.searchTerm() || 
        ident.matricule.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        ident.employeeName.toLowerCase().includes(this.searchTerm().toLowerCase());
      
      return statusMatch && searchMatch;
    });
  }

  stats() {
    const all = this.identifications();
    return {
      total: all.length,
      complete: all.filter(i => i.status === 'complete').length,
      incomplete: all.filter(i => i.status === 'incomplete').length,
      missing: all.filter(i => i.status === 'missing').length,
      error: all.filter(i => i.status === 'error').length
    };
  }

  identifyDaily() {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.successMessage.set(`Daily entry/exit identification completed for ${this.selectedDate()}`);
      this.isLoading.set(false);
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 1500);
  }

  reprocessErrors() {
    const errors = this.identifications().filter(i => i.status === 'error' || i.status === 'incomplete');
    if (errors.length === 0) {
      this.errorMessage.set('No errors or incomplete records to reprocess');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      this.successMessage.set(`Reprocessed ${errors.length} records`);
      this.isLoading.set(false);
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 1000);
  }

  exportReport() {
    this.successMessage.set('Exporting report...');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'incomplete': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'complete': return '✅';
      case 'incomplete': return '⚠️';
      case 'missing': return '❌';
      case 'error': return '🔴';
      default: return '❓';
    }
  }
}
