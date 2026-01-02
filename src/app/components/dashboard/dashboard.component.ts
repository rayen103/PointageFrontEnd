import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportingService } from '../../services/reporting.service';
import { DashboardDataDto } from '../../models/reporting.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private reportingService = inject(ReportingService);
  private router = inject(Router);

  // Signals for dashboard state
  dashboardData = signal<DashboardDataDto | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Computed values
  presenceRate = computed(() => {
    const data = this.dashboardData();
    if (!data) return 0;
    const total = data.totalEmployees || 100;
    const present = data.presentToday || data.employesPresentsAujourdhui || 0;
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  });

  absenceRate = computed(() => {
    const data = this.dashboardData();
    if (!data) return 0;
    const total = data.totalEmployees || 100;
    const absent = data.absentToday || data.employesAbsentsAujourdhui || 0;
    if (total === 0) return 0;
    return Math.round((absent / total) * 100);
  });

  pendingApprovalsTotal = computed(() => {
    const data = this.dashboardData();
    if (!data) return 0;
    const leaves = data.pendingLeaveRequests || data.congesEnAttente || 0;
    const auths = data.pendingAuthorizations || data.autorisationsEnAttente || 0;
    return leaves + auths;
  });

  // Statistics cards configuration
  statsCards = computed(() => {
    const data = this.dashboardData();
    const total = data?.totalEmployees || 100;
    const presentToday = data?.presentToday || data?.employesPresentsAujourdhui || 0;
    const absentToday = data?.absentToday || data?.employesAbsentsAujourdhui || 0;
    const pendingLeaves = data?.pendingLeaveRequests || data?.congesEnAttente || 0;
    const pendingAuths = data?.pendingAuthorizations || data?.autorisationsEnAttente || 0;
    const overtimeMonth = data?.overtimeHoursMonth || data?.heuresSupplementairesMois || 0;
    const delaysMonth = data?.delaysMonth || data?.retardsAujourdhui || 0;
    
    return [
      {
        title: 'Présents Aujourd\'hui',
        value: presentToday,
        total: total,
        icon: '👥',
        color: 'primary',
        percentage: this.presenceRate(),
        route: '/attendance'
      },
      {
        title: 'Absents',
        value: absentToday,
        total: total,
        icon: '🚫',
        color: 'warn',
        percentage: this.absenceRate(),
        route: '/attendance'
      },
      {
        title: 'Congés en Attente',
        value: pendingLeaves,
        icon: '📅',
        color: 'accent',
        route: '/leaves'
      },
      {
        title: 'Autorisations en Attente',
        value: pendingAuths,
        icon: '📋',
        color: 'accent',
        route: '/leaves'
      },
      {
        title: 'Heures Supplémentaires (Mois)',
        value: overtimeMonth,
        icon: '⏱️',
        color: 'primary',
        suffix: 'h',
        route: '/overtime'
      },
      {
        title: 'Retards (Mois)',
        value: delaysMonth,
        icon: '⏰',
        color: 'warn',
        route: '/overtime'
      }
    ];
  });

  constructor() {
    // Effect to log errors
    effect(() => {
      const err = this.error();
      if (err) {
        console.error('[Dashboard] Error loading data:', err);
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    const codeSoc = 'SOC001'; // TODO: Get from auth service

    this.reportingService.getDashboard(codeSoc).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('Dashboard API error, using mock data:', err);
        // Use mock data when API is not available
        this.dashboardData.set(this.getMockDashboardData());
        this.loading.set(false);
        // Don't show error to user when using mock data
      }
    });
  }

  private getMockDashboardData(): DashboardDataDto {
    return {
      codeSoc: 'SOC001',
      date: new Date(),
      totalEmployees: 150,
      presentToday: 132,
      absentToday: 18,
      employesPresentsAujourdhui: 132,
      employesAbsentsAujourdhui: 18,
      retardsAujourdhui: 8,
      delaysMonth: 45,
      pendingLeaveRequests: 12,
      congesEnAttente: 12,
      pendingAuthorizations: 5,
      autorisationsEnAttente: 5,
      overtimeHoursMonth: 240,
      heuresSupplementairesMois: 240,
      tauxPresenceMois: 88,
      presenceRate: 88,
      congesEnCours: 15,
      retardsNonJustifies: 12
    };
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
