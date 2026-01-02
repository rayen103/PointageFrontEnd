import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  OvertimeDelayService,
  HeuresSupplementairesDto,
  HeuresSupplementairesSearchRequest
} from '../../services/overtime-delay.service';

@Component({
  selector: 'app-overtime-tracking',
  standalone: true,
  imports: [
    CommonModule,
  ]

  templateUrl: './overtime-tracking.component.html',})
export class OvertimeTrackingComponent implements OnInit {
  private overtimeService = inject(OvertimeDelayService);

  overtimes = signal<HeuresSupplementairesDto[]>([]);
  loading = signal(false);

