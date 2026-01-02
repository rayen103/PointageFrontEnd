import { Component, Inject, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ScheduleManagementService,
  EquipeDto,
  EquipeEmpDto,
  TeamMemberRequest
} from '../../services/schedule-management.service';

export interface TeamMemberDialogData {
  team: EquipeDto;
}

@Component({
  selector: 'app-team-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './team-member-dialog.component.html'
})
export class TeamMemberDialogComponent implements OnInit {
  private scheduleService = inject(ScheduleManagementService);

  dialogRef = inject(MatDialogRef<TeamMemberDialogComponent>);
  data = inject<TeamMemberDialogData>(MAT_DIALOG_DATA);

  members = signal<EquipeEmpDto[]>([]);
  loading = signal(false);
  newMatricule = '';

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading.set(true);
    this.scheduleService.getTeamMembers('SOC001', this.data.team.codeEq).subscribe({
      next: (m) => {
        this.members.set(m);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addMember(): void {
    const matricule = (this.newMatricule || '').trim();
    if (!matricule) return;
    const req: TeamMemberRequest = { codeSoc: 'SOC001', codeEq: this.data.team.codeEq, matricule };
    this.scheduleService.addTeamMember(req).subscribe({
      next: () => {
        this.loadMembers();
        this.newMatricule = '';
      }
    });
  }

  removeMember(member: EquipeEmpDto): void {
    this.scheduleService.removeTeamMember(member.codeSoc, member.codeEq, member.matricule).subscribe({
      next: () => this.loadMembers()
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}

