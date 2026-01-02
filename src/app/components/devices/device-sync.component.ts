import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceManagementService } from '../../services/device-management.service';
import { TerminalDto, SyncTerminalRequest, SyncResultDto } from '../../models/device.models';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-device-sync',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule
  ],
  templateUrl: './device-sync.component.html'
})
export class DeviceSyncComponent {
  private deviceService = inject(DeviceManagementService);
  private snackBar = inject(MatSnackBar);

  terminals = signal<TerminalDto[]>([]);
  syncing = signal(false);
  syncStatus = signal('');
  lastSyncResult = signal<SyncResultDto | null>(null);
  syncHistory = signal<SyncResultDto[]>([]);
  selectedTerminalId: number | null = null;

  constructor() {
    this.loadTerminals();
    this.loadSyncHistory();
  }

  private loadTerminals(): void {
    this.deviceService.getTerminals().subscribe({
      next: (terminals: TerminalDto[]) => {
        this.terminals.set(terminals);
      },
      error: (err: Error) => {
        this.snackBar.open(`Erreur lors du chargement des terminaux: ${err.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  private loadSyncHistory(): void {
    // Mock history - in real app, fetch from backend
    const mockHistory: SyncResultDto[] = [
      {
        terminalId: 1,
        success: true,
        recordsAdded: 45,
        recordsUpdated: 12,
        errors: 0,
        duration: 8,
        message: 'Synchronisation réussie',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        terminalId: 2,
        success: true,
        recordsAdded: 32,
        recordsUpdated: 8,
        errors: 0,
        duration: 6,
        message: 'Synchronisation réussie',
        timestamp: new Date(Date.now() - 7200000)
      }
    ];
    this.syncHistory.set(mockHistory);
  }

  startSync(): void {
    if (!this.selectedTerminalId) {
      return;
    }

    this.syncing.set(true);
    this.syncStatus.set('Connexion au terminal...');

    const request: SyncTerminalRequest = {
      terminalId: this.selectedTerminalId,
      syncType: 'full'
    };

    setTimeout(() => this.syncStatus.set('Téléchargement des données...'), 1000);
    setTimeout(() => this.syncStatus.set('Traitement des enregistrements...'), 2000);

    this.deviceService.syncTerminal(request).subscribe({
      next: (result: SyncResultDto) => {
        this.syncing.set(false);
        this.syncStatus.set('');
        this.lastSyncResult.set(result);
        this.syncHistory.update(history => [result, ...history]);
        this.snackBar.open('Synchronisation terminée avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err: Error) => {
        this.syncing.set(false);
        this.syncStatus.set('');
        this.snackBar.open(`Erreur de synchronisation: ${err.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  syncAll(): void {
    if (this.terminals().length === 0) {
      return;
    }

    this.syncing.set(true);
    this.syncStatus.set('Synchronisation de tous les terminaux...');

    // Mock sync all - in real app, call backend
    setTimeout(() => {
      this.syncing.set(false);
      this.syncStatus.set('');
      const result: SyncResultDto = {
        terminalId: 0,
        success: true,
        recordsAdded: 120,
        recordsUpdated: 45,
        errors: 2,
        duration: 25,
        message: `Synchronisation de ${this.terminals().length} terminaux terminée`,
        timestamp: new Date()
      };
      this.lastSyncResult.set(result);
      this.snackBar.open('Synchronisation globale terminée', 'Fermer', { duration: 3000 });
    }, 5000);
  }
}
