import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ExitAuthorization {
  id: number;
  matricule: string;
  employeeName: string;
  date: string;
  exitTime: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

@Component({
  selector: 'app-exit-authorization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exit-authorization.component.html'
})
export class ExitAuthorizationComponent {
  // Signals for reactive state
  authorizations = signal<ExitAuthorization[]>([
    {
      id: 1,
      matricule: 'EMP001',
      employeeName: 'Ahmed Benali',
      date: '2025-12-31',
      exitTime: '14:30',
      reason: 'Rendez-vous médical',
      requestedAt: '2025-12-31 09:00',
      status: 'pending'
    },
    {
      id: 2,
      matricule: 'EMP002',
      employeeName: 'Sara Mansouri',
      date: '2025-12-31',
      exitTime: '16:00',
      reason: 'Urgence familiale',
      requestedAt: '2025-12-31 10:15',
      status: 'approved',
      approvedBy: 'Manager',
      approvedAt: '2025-12-31 10:30'
    },
    {
      id: 3,
      matricule: 'EMP003',
      employeeName: 'Mohamed Alami',
      date: '2025-12-30',
      exitTime: '15:00',
      reason: 'Raison personnelle',
      requestedAt: '2025-12-30 08:30',
      status: 'rejected',
      approvedBy: 'Manager',
      approvedAt: '2025-12-30 09:00',
      comments: 'Insufficient justification'
    }
  ]);

  filterStatus = signal<string>('all');
  filterDate = signal<string>(new Date().toISOString().split('T')[0]);
  searchTerm = signal<string>('');
  
  selectedAuthorization = signal<ExitAuthorization | null>(null);
  showApprovalModal = signal<boolean>(false);
  approvalComments = signal<string>('');

  newAuthorization = signal({
    matricule: '',
    date: new Date().toISOString().split('T')[0],
    exitTime: '',
    reason: ''
  });
  showNewModal = signal<boolean>(false);

  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  filteredAuthorizations() {
    return this.authorizations().filter(auth => {
      const statusMatch = this.filterStatus() === 'all' || auth.status === this.filterStatus();
      const dateMatch = !this.filterDate() || auth.date === this.filterDate();
      const searchMatch = !this.searchTerm() || 
        auth.matricule.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        auth.employeeName.toLowerCase().includes(this.searchTerm().toLowerCase());
      
      return statusMatch && dateMatch && searchMatch;
    });
  }

  stats() {
    const all = this.authorizations();
    return {
      total: all.length,
      pending: all.filter(a => a.status === 'pending').length,
      approved: all.filter(a => a.status === 'approved').length,
      rejected: all.filter(a => a.status === 'rejected').length
    };
  }

  openNewModal() {
    this.showNewModal.set(true);
  }

  closeNewModal() {
    this.showNewModal.set(false);
    this.newAuthorization.set({
      matricule: '',
      date: new Date().toISOString().split('T')[0],
      exitTime: '',
      reason: ''
    });
  }

  submitNewAuthorization() {
    const newAuth: ExitAuthorization = {
      id: this.authorizations().length + 1,
      matricule: this.newAuthorization().matricule,
      employeeName: 'Employee Name', // Would come from API
      date: this.newAuthorization().date,
      exitTime: this.newAuthorization().exitTime,
      reason: this.newAuthorization().reason,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    this.authorizations.update(auths => [...auths, newAuth]);
    this.successMessage.set('Authorization request submitted successfully');
    this.closeNewModal();
    
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  openApprovalModal(auth: ExitAuthorization) {
    this.selectedAuthorization.set(auth);
    this.showApprovalModal.set(true);
    this.approvalComments.set('');
  }

  closeApprovalModal() {
    this.showApprovalModal.set(false);
    this.selectedAuthorization.set(null);
    this.approvalComments.set('');
  }

  approveAuthorization() {
    const auth = this.selectedAuthorization();
    if (!auth) return;

    this.authorizations.update(auths =>
      auths.map(a => a.id === auth.id ? {
        ...a,
        status: 'approved' as const,
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
        comments: this.approvalComments()
      } : a)
    );

    this.successMessage.set('Authorization approved successfully');
    this.closeApprovalModal();
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  rejectAuthorization() {
    const auth = this.selectedAuthorization();
    if (!auth) return;

    this.authorizations.update(auths =>
      auths.map(a => a.id === auth.id ? {
        ...a,
        status: 'rejected' as const,
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
        comments: this.approvalComments()
      } : a)
    );

    this.successMessage.set('Authorization rejected');
    this.closeApprovalModal();
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  }
}
