import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AuditService,
  AdjustmentTrace
} from '../../services/audit.service';

@Component({
  selector: 'app-adjustment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adjustment-history.component.html',
})
export class AdjustmentHistoryComponent implements OnInit {
  private auditService = inject(AuditService);
  private route = inject(ActivatedRoute);

  adjustments = signal<AdjustmentTrace[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  codeSociete = signal('DEFAULT');
  matricule = signal('');
  dateDebut = signal('');
  dateFin = signal('');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['matricule']) {
        this.matricule.set(params['matricule']);
        this.loadHistory();
      }
    });
  }

  loadHistory(): void {
    if (!this.matricule()) {
      this.error.set('Veuillez saisir un matricule');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auditService.getAdjustmentHistory(
      this.codeSociete(),
      this.matricule(),
      this.dateDebut() || undefined,
      this.dateFin() || undefined
    ).subscribe({
      next: (data) => {
        this.adjustments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  getAdjustmentTypeColor(type: string): string {
    if (type?.includes('AUTOMATIC')) return 'bg-blue-100 text-blue-800';
    if (type?.includes('MANUAL')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  }
}
