import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OvertimeDelayService, HeuresSupplementairesDto } from '../../services/overtime-delay.service';

@Component({
  selector: 'app-overtime-statistics',
  standalone: true,
  imports: [
    CommonModule,
  ]

  templateUrl: './overtime-statistics.component.html',})
export class OvertimeStatisticsComponent implements OnInit {
  private overtimeService = inject(OvertimeDelayService);

  overtimes = signal<HeuresSupplementairesDto[]>([]);
  loading = signal(false);

  totalHs25 = computed(() => 
    this.overtimes().reduce((sum, ot) => sum + (ot.hs1_25 || 0), 0)
  );
  totalHs50 = computed(() => 
    this.overtimes().reduce((sum, ot) => sum + (ot.hs1_5 || 0), 0)
  );
  totalHs75 = computed(() => 
    this.overtimes().reduce((sum, ot) => sum + (ot.hs1_75 || 0), 0)
  );
  totalHs100 = computed(() => 
    this.overtimes().reduce((sum, ot) => sum + (ot.hs2_00 || 0), 0)
  );

  countHs25 = computed(() => 
    this.overtimes().filter(ot => (ot.hs1_25 || 0) > 0).length
  );
  countHs50 = computed(() => 
    this.overtimes().filter(ot => (ot.hs1_5 || 0) > 0).length
  );
  countHs75 = computed(() => 
    this.overtimes().filter(ot => (ot.hs1_75 || 0) > 0).length
  );
  countHs100 = computed(() => 
    this.overtimes().filter(ot => (ot.hs2_00 || 0) > 0).length
  );

  totalHours = computed(() => 
    this.totalHs25() + this.totalHs50() + this.totalHs75() + this.totalHs100()
  );

  totalRecords = computed(() => this.overtimes().length);

  weightedTotal = computed(() => 
    (this.totalHs25() * 1.25) + 
    (this.totalHs50() * 1.50) + 
    (this.totalHs75() * 1.75) + 
    (this.totalHs100() * 2.00)
  );

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading.set(true);

    this.overtimeService.searchOvertime({
      codeSoc: 'SOC001',
      dateDebut: new Date(new Date().getFullYear(), 0, 1),
      dateFin: new Date()
    }).subscribe({
      next: (overtimes: HeuresSupplementairesDto[]) => {
        this.overtimes.set(overtimes);
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Error loading statistics:', err);
        this.loading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadStatistics();
  }
}
