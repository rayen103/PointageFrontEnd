import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  AttendanceProcessingService
} from '../../services/attendance-processing.service';
import { ReportingService } from '../../services/reporting.service';
import { DashboardDataDto } from '../../models/reporting.models';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule
  ],
  templateUrl: './attendance-dashboard.component.html',
})
export class AttendanceDashboardComponent implements OnInit {
  private reportingService = inject(ReportingService);

  loading = signal(false);
  dashboardData = signal<DashboardDataDto | null>(null);

  // Computed values
  totalEmployees = computed(() => this.dashboardData()?.totalEmployees || 100);
  presentToday = computed(() =>
    this.dashboardData()?.employesPresentsAujourdhui || 0
  );
  absentToday = computed(() =>
    this.dashboardData()?.employesAbsentsAujourdhui || 0
  );
  delays = computed(() =>
    this.dashboardData()?.retardsAujourdhui || 0
  );
  presenceRate = computed(() =>
    Math.round(this.dashboardData()?.tauxPresenceMois || 0)
  );
  pendingLeaves = computed(() =>
    this.dashboardData()?.congesEnAttente || 0
  );
  overtimeHours = computed(() =>
    Math.round(this.dashboardData()?.heuresSupplementairesMois || 0)
  );
  absenceRate = computed(() => {
    const total = this.totalEmployees();
    const absent = this.absentToday();
    return total > 0 ? Math.round((absent / total) * 100) : 0;
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.reportingService.getDashboard('SOC001').subscribe({
      next: (data: DashboardDataDto) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Error loading dashboard:', err);
        this.loading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadDashboard();
  }
}
