import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  OvertimeDelayService,
  HeuresSupplementairesDto,
  HeuresSupplementairesCreateRequest
} from '../../services/overtime-delay.service';

@Component({
  selector: 'app-overtime-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]

  templateUrl: './overtime-form.component.html',})
export class OvertimeFormComponent implements OnInit {
  private overtimeService = inject(OvertimeDelayService);

  loading = signal(false);
  
  matricule = '';
  selectedDate = new Date();
  hs25 = 0;
  hs50 = 0;
  hs75 = 0;
  hs100 = 0;

  ngOnInit(): void {}

  calculateTotal(): number {
    return (this.hs25 || 0) + (this.hs50 || 0) + (this.hs75 || 0) + (this.hs100 || 0);
  }

  calculateWeightedTotal(): number {
    return (
      (this.hs25 || 0) * 1.25 +
      (this.hs50 || 0) * 1.50 +
      (this.hs75 || 0) * 1.75 +
      (this.hs100 || 0) * 2.00
    );
  }

  isValid(): boolean {
    return this.matricule.trim() !== '' && this.calculateTotal() > 0;
  }

  reset(): void {
    this.matricule = '';
    this.selectedDate = new Date();
    this.hs25 = 0;
    this.hs50 = 0;
    this.hs75 = 0;
    this.hs100 = 0;
  }

  submit(): void {
    if (!this.isValid()) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading.set(true);

    const request: HeuresSupplementairesCreateRequest = {
      codeSoc: 'SOC001',
      matricule: this.matricule,
      dateHeureSupp: this.selectedDate,
      heuresSupp25: this.hs25,
      heuresSupp50: this.hs50,
      heuresSupp75: this.hs75,
      heuresSupp100: this.hs100
    };

    this.overtimeService.createOvertime(request).subscribe({
      next: () => {
        this.snackBar.open('Heures supplémentaires enregistrées avec succès', 'Fermer', { duration: 3000 });
        this.loading.set(false);
        this.reset();
      },
      error: (err: Error) => {
        this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}
