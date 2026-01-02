import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SystemParametersService, SystemParameters, UpdateSystemParametersRequest } from '../../services/system-parameters.service';

@Component({
  selector: 'app-system-parameters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './system-parameters.component.html',
  styleUrls: ['./system-parameters.component.scss']
})
export class SystemParametersComponent implements OnInit {
  private readonly service = inject(SystemParametersService);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    codeSoc: ['CST', [Validators.required]],
    nbrPortionHeure: [null, [Validators.min(1)]],
    arrondiPointEnt: [null, [Validators.min(1), Validators.max(3)]],
    arrondiPointSort: [null, [Validators.min(1), Validators.max(3)]],
    portionHeureSupp: [null, [Validators.min(0)]],
    intervalRepete: [null, [Validators.min(0)]],
    demarragePosteNuit: [null, [Validators.min(0), Validators.max(1)]],
    refPosteMensuel: [null],
    refPosteHoraire: [null]
  });

  readonly loading = signal(false);
  readonly toast = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  readonly hasChanges = computed(() => this.form.dirty && this.form.valid);

  ngOnInit(): void {
    this.loadParameters();
  }

  loadParameters(): void {
    if (this.form.invalid) return;
    const codeSoc = this.form.get('codeSoc')?.value;
    if (!codeSoc) return;

    this.loading.set(true);
    this.service.getParameters(codeSoc).subscribe({
      next: (data: SystemParameters) => {
        this.form.patchValue({
          nbrPortionHeure: data.nbrPortionHeure,
          arrondiPointEnt: data.arrondiPointEnt,
          arrondiPointSort: data.arrondiPointSort,
          portionHeureSupp: data.portionHeureSupp,
          intervalRepete: data.intervalRepete,
          demarragePosteNuit: data.demarragePosteNuit,
          refPosteMensuel: data.refPosteMensuel,
          refPosteHoraire: data.refPosteHoraire
        });
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading system parameters', error);
        this.showToast('error', 'Erreur lors du chargement des paramètres');
        this.loading.set(false);
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const codeSoc = this.form.get('codeSoc')?.value;
    if (!codeSoc) {
      this.showToast('error', 'Code société requis');
      return;
    }

    const payload: UpdateSystemParametersRequest = {
      nbrPortionHeure: this.toNullableNumber(this.form.value.nbrPortionHeure),
      arrondiPointEnt: this.toNullableNumber(this.form.value.arrondiPointEnt),
      arrondiPointSort: this.toNullableNumber(this.form.value.arrondiPointSort),
      portionHeureSupp: this.toNullableNumber(this.form.value.portionHeureSupp),
      intervalRepete: this.toNullableNumber(this.form.value.intervalRepete),
      demarragePosteNuit: this.toNullableNumber(this.form.value.demarragePosteNuit),
      refPosteMensuel: this.form.value.refPosteMensuel ?? null,
      refPosteHoraire: this.form.value.refPosteHoraire ?? null
    };

    this.loading.set(true);
    this.service.updateParameters(codeSoc, payload).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.form.markAsPristine();
        this.showToast('success', 'Paramètres enregistrés');
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error saving system parameters', error);
        const message = error?.error?.error ?? 'Erreur lors de la sauvegarde des paramètres';
        this.showToast('error', message);
        this.loading.set(false);
      }
    });
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private showToast(type: 'success' | 'error', text: string): void {
    this.toast.set({ type, text });
    setTimeout(() => this.toast.set(null), 3200);
  }
}

