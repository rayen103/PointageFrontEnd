import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ScheduleManagementService,
  EquipeDto,
  EquipeSearchRequest,
  EquipeEmpDto
} from '../../services/schedule-management.service';
import { TeamFormDialogComponent } from './team-form-dialog.component';
import { TeamMemberDialogComponent } from './team-member-dialog.component';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './team-management.component.html'
})
export class TeamManagementComponent implements OnInit {
  private scheduleService = inject(ScheduleManagementService);
  private dialog = inject(MatDialog);

  teams = signal<EquipeDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading.set(true);
    this.error.set(null);
    this.scheduleService.searchTeams({ codeSoc: 'SOC001' }).subscribe({
      next: (t) => {
        this.teams.set(t);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur lors du chargement des équipes');
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    console.log('openCreateDialog');
  }

  openEditDialog(_team: EquipeDto): void {
    console.log('openEditDialog', _team);
  }

  deleteTeam(_team: EquipeDto): void {
    console.log('deleteTeam', _team);
  }

  manageMembers(_team: EquipeDto): void {
    console.log('manageMembers', _team);
  }
}

