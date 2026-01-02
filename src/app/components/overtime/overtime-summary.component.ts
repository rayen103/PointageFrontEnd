import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OvertimeDelayService,
  MonthlySummaryDto
} from '../../services/overtime-delay.service';

type OvertimeDetailRow = {
  category: string;
  hours: number;
  rate: string;
  weighted: number;
};

@Component({
  selector: 'app-overtime-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './overtime-summary.component.html',
})
export class OvertimeSummaryComponent implements OnInit {
  private overtimeService = inject(OvertimeDelayService);

  private codeSoc = 'SOC001';
  private matricule = 'EMP001';

  loading = signal(false);
  summary = signal<MonthlySummaryDto | null>(null);

  detailRows = computed<OvertimeDetailRow[]>(() => {
    const current = this.summary();
    if (!current) {
      return [];
    }

    const rows: OvertimeDetailRow[] = [
      {
        category: 'HS 25%',
        hours: current.totalHeuresSupp25 || 0,
        rate: '1.25x',
        weighted: (current.totalHeuresSupp25 || 0) * 1.25,
      },
      {
        category: 'HS 50%',
        hours: current.totalHeuresSupp50 || 0,
        rate: '1.50x',
        weighted: (current.totalHeuresSupp50 || 0) * 1.5,
      },
      {
        category: 'HS 75%',
        hours: current.totalHeuresSupp75 || 0,
        rate: '1.75x',
        weighted: (current.totalHeuresSupp75 || 0) * 1.75,
      },
      {
        category: 'HS 100%',
        hours: current.totalHeuresSupp100 || 0,
        rate: '2.00x',
        weighted: (current.totalHeuresSupp100 || 0) * 2,
      },
    ];

    return rows.filter(row => row.hours > 0 || row.weighted > 0);
  });

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

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
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);

    this.overtimeService
      .getOvertimeSummary(this.codeSoc, this.matricule, this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (data: MonthlySummaryDto) => {
          this.summary.set(data);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load overtime summary', error);
          this.summary.set(null);
          this.loading.set(false);
        },
      });
  }

  calculateTotal(): number {
    const current = this.summary();
    if (!current) {
      return 0;
    }

    return (
      (current.totalHeuresSupp25 || 0) +
      (current.totalHeuresSupp50 || 0) +
      (current.totalHeuresSupp75 || 0) +
      (current.totalHeuresSupp100 || 0)
    );
  }

}
