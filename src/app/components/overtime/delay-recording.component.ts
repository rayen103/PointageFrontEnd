import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  OvertimeDelayService,
  RetardDto,
  RetardCreateRequest
} from '../../services/overtime-delay.service';

@Component({
  selector: 'app-delay-recording',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]

  templateUrl: './delay-recording.component.html',})
export class DelayRecordingComponent implements OnInit {
  private delayService = inject(OvertimeDelayService);

  loading = signal(false);
  loadingList = signal(false);
  delays = signal<RetardDto[]>([]);

  matricule = '';
  selectedDate = new Date();
  retardMn = 0;

