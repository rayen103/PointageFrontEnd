import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ScheduleManagementService,
  ShiftDto,
  ShiftSearchRequest
} from '../../services/schedule-management.service';
import { ShiftFormDialogComponent } from './shift-form-dialog.component';

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './shift-management.component.html'
})
export class ShiftManagementComponent implements OnInit {
  private scheduleService = inject(ScheduleManagementService);
  private dialog = inject(MatDialog);

  shifts = signal<ShiftDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadShifts();
  }

  loadShifts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.scheduleService.searchShifts({ codeSoc: 'SOC001' }).subscribe({
      next: (s) => {
        this.shifts.set(s);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur lors du chargement des shifts');
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    // Future: open dialog
    console.log('openCreateDialog');
  }

  openEditDialog(_shift: ShiftDto): void {
    console.log('openEditDialog', _shift);
  }

  deleteShift(_shift: ShiftDto): void {
    console.log('deleteShift', _shift);
  }
}

