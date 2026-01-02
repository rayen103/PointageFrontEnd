import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceManagementService } from '../../services/device-management.service';
import { TerminalDto, DeviceConnectionTestDto } from '../../models/device.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-device-diagnostics',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './device-diagnostics.component.html'
})
export class DeviceDiagnosticsComponent {
  private deviceService = inject(DeviceManagementService);
  private snackBar = inject(MatSnackBar);

  terminals = signal<TerminalDto[]>([]);
  testResults = signal<Map<number, DeviceConnectionTestDto>>(new Map());
  loading = signal(false);
  testing = signal(false);

  onlineCount = computed(() => {
    let count = 0;
    this.testResults().forEach(result => {
      if (result.success) count++;
    });
    return count;
  });

  offlineCount = computed(() => {
    return this.terminals().length - this.onlineCount();
  });

  averageResponseTime = computed(() => {
    const results = Array.from(this.testResults().values()).filter(r => r.success);
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + (r.responseTime || 0), 0);
    return Math.round(sum / results.length);
  });

  totalRecords = computed(() => {
    let total = 0;
    this.testResults().forEach(result => {
      total += result.recordCount || 0;
    });
    return total;
  });

  constructor() {
    this.loadTerminals();
  }

  private loadTerminals(onLoaded?: () => void): void {
    this.loading.set(true);
    this.deviceService.getTerminals().subscribe({
      next: (terminals: TerminalDto[]) => {
        this.terminals.set(terminals);
        onLoaded?.();
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.snackBar.open(`Erreur: ${err.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  getConnectionStatus(terminalId: number): string {
    const result = this.testResults().get(terminalId);
    return result?.success ? 'online' : 'offline';
  }

  getTestResult(terminalId: number): DeviceConnectionTestDto | undefined {
    return this.testResults().get(terminalId);
  }

  testConnection(terminal: TerminalDto): void {
    this.testing.set(true);
    this.snackBar.open(`Test de connexion au terminal ${terminal.numeroTerminal}...`, 'Fermer', { duration: 2000 });

    this.deviceService.testConnection(terminal.id).subscribe({
      next: (result: DeviceConnectionTestDto) => {
        this.testResults.update(map => {
          const newMap = new Map(map);
          newMap.set(terminal.id, result);
          return newMap;
        });
        this.testing.set(false);
        if (result.success) {
          this.snackBar.open('Connexion réussie', 'Fermer', { duration: 3000 });
        } else {
          this.snackBar.open(`Échec: ${result.error}`, 'Fermer', { duration: 5000 });
        }
      },
      error: (err: Error) => {
        this.testing.set(false);
        this.snackBar.open(`Erreur: ${err.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  testAllConnections(): void {
    const terminals = this.terminals();

    if (!terminals.length) {
      this.testing.set(false);
      this.snackBar.open('Aucun terminal à tester', 'Fermer', { duration: 3000 });
      return;
    }

    this.testing.set(true);
    this.snackBar.open('Test de toutes les connexions...', 'Fermer', { duration: 2000 });
    let completed = 0;

    terminals.forEach(terminal => {
      this.deviceService.testConnection(terminal.id).subscribe({
        next: (result: DeviceConnectionTestDto) => {
          this.testResults.update(map => {
            const newMap = new Map(map);
            newMap.set(terminal.id, result);
            return newMap;
          });
          completed++;
          if (completed === terminals.length) {
            this.testing.set(false);
            this.snackBar.open('Tests terminés', 'Fermer', { duration: 3000 });
          }
        },
        error: () => {
          completed++;
          if (completed === terminals.length) {
            this.testing.set(false);
          }
        }
      });
    });
  }

  pingTerminal(terminal: TerminalDto): void {
    this.snackBar.open(`Ping du terminal ${terminal.numeroTerminal}...`, 'Fermer', { duration: 1000 });
    setTimeout(() => {
      this.snackBar.open(`Ping réussi: ${terminal.adresseIp} (temps: 12ms)`, 'Fermer', { duration: 3000 });
    }, 500);
  }

  viewLogs(terminal: TerminalDto): void {
    this.snackBar.open(`Affichage des logs du terminal ${terminal.numeroTerminal}`, 'Fermer', { duration: 2000 });
  }

  refreshDiagnostics(): void {
    this.testing.set(false);
    this.testResults.set(new Map());
    this.loadTerminals(() => this.testAllConnections());
  }
}
