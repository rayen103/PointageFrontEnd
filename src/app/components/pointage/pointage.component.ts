import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PointageService, PointageSearchRequest, PointageDto, PointageSummaryDto } from '../../services/pointage.service';

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pointage.component.html',
  styleUrl: './pointage.component.scss'
})
export class PointageComponent implements OnInit {
  private readonly pointageService = inject(PointageService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pointages = signal<PointageDto[]>([]);
  readonly summaries = signal<PointageSummaryDto[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(50);

  searchRequest: PointageSearchRequest = {
    page: 1,
    pageSize: 50
  };

  summaryParams = {
    codeSociete: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    matricule: ''
  };

  showSummary = false;

  ngOnInit(): void {
    this.loadPointages();
  }

  loadPointages(): void {
    this.loading.set(true);
    this.error.set(null);
    this.searchRequest.page = this.currentPage();

    this.pointageService.rechercher(this.searchRequest).subscribe({
      next: (response) => {
        this.pointages.set(response.data);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  loadSummary(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pointageService.getSummary(
      this.summaryParams.codeSociete,
      this.summaryParams.dateDebut,
      this.summaryParams.dateFin,
      this.summaryParams.matricule || undefined
    ).subscribe({
      next: (summaries) => {
        this.summaries.set(summaries);
        this.showSummary = true;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPointages();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize());
  }
}

