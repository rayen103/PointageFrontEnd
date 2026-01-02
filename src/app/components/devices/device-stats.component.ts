import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceManagementService } from '../../services/device-management.service';
import { TerminalDto, DeviceStatsDto } from '../../models/device.models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-device-stats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './device-stats.component.html'
})
export class DeviceStatsComponent {
  private deviceService = inject(DeviceManagementService);
  private snackBar = inject(MatSnackBar);

  terminals = signal<TerminalDto[]>([]);
  loading = signal(false);
  selectedTerminalId: number | null = null;

  stats = signal<DeviceStatsDto>({
    totalPointages: 0,
    employeesEnrolled: 0,
    devicesOnline: 0,
    totalDevices: 0,
    storageUsed: 0,
    lastSyncCount: 0,
    lastSyncTime: new Date(),
    syncErrors: 0,
    totalSyncs: 0
  });

  averageDailyPointages = computed(() => {
    return Math.round(this.stats().totalPointages * 30 / 7);
  });

  deviceUptime = computed(() => {
    const stats = this.stats();
    if (stats.totalDevices === 0) return 0;
    return Math.round((stats.devicesOnline / stats.totalDevices) * 100);
  });

  constructor() {
    this.loadTerminals();
    this.loadStats();
  }

  private loadTerminals(): void {
    this.loading.set(true);
    this.deviceService.getTerminals().subscribe({
      next: (terminals: TerminalDto[]) => {
        this.terminals.set(terminals);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.snackBar.open(`Erreur: ${err.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  private loadStats(): void {
    // Mock stats - in real app, fetch from backend
    const mockStats: DeviceStatsDto = {
      totalPointages: 247,
      employeesEnrolled: 156,
      devicesOnline: 3,
      totalDevices: 4,
      storageUsed: 45,
      lastSyncCount: 89,
      lastSyncTime: new Date(),
      syncErrors: 2,
      totalSyncs: 124
    };

    this.stats.set(mockStats);
  }

  onTerminalChange(): void {
    this.refreshStats();
  }

  refreshStats(): void {
    this.loadStats();
    this.snackBar.open('Statistiques actualisées', 'Fermer', { duration: 2000 });
  }

  getTerminalPointages(terminalId: number): number {
    // Mock data - in real app, fetch from backend
    return Math.floor(Math.random() * 100) + 20;
  }

  getTerminalEmployees(terminalId: number): number {
    // Mock data - in real app, fetch from backend
    return Math.floor(Math.random() * 50) + 30;
  }

  getTerminalMemory(terminalId: number): number {
    // Mock data - in real app, fetch from backend
    return Math.floor(Math.random() * 60) + 20;
  }
}
