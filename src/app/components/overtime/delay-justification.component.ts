import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OvertimeDelayService, RetardDto } from '../../services/overtime-delay.service';

@Component({
  selector: 'app-delay-justification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]

  templateUrl: './delay-justification.component.html',})
export class DelayJustificationComponent implements OnInit {
  private delayService = inject(OvertimeDelayService);

  delays = signal<RetardDto[]>([]);
  loading = signal(false);

