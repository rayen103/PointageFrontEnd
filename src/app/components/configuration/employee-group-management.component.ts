import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EmployeeGroup {
  id: string;
  code: string;
  nom: string;
  description: string;
  nombreEmployes: number;
  actif: boolean;
}

interface EmployeeGroupForm {
  code: string;
  nom: string;
  description: string;
  actif: boolean;
}

@Component({
  selector: 'app-employee-group-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-group-management.component.html',
})
export class EmployeeGroupManagementComponent {
  groups = signal<EmployeeGroup[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  showForm = signal(false);
  editingGroup = signal<EmployeeGroup | null>(null);
  groupForm = signal<EmployeeGroupForm>({
    code: '',
    nom: '',
    description: '',
    actif: true
  });

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading.set(true);
    // Simulated data - in production, this would call an API
    setTimeout(() => {
      this.groups.set([
        { id: '1', code: 'GRP001', nom: 'Équipe IT', description: 'Département informatique', nombreEmployes: 15, actif: true },
        { id: '2', code: 'GRP002', nom: 'Équipe RH', description: 'Ressources humaines', nombreEmployes: 8, actif: true },
        { id: '3', code: 'GRP003', nom: 'Équipe Finance', description: 'Service financier', nombreEmployes: 12, actif: false },
      ]);
      this.loading.set(false);
    }, 500);
  }

  openForm(group?: EmployeeGroup): void {
    if (group) {
      this.editingGroup.set(group);
      this.groupForm.set({
        code: group.code,
        nom: group.nom,
        description: group.description,
        actif: group.actif
      });
    } else {
      this.editingGroup.set(null);
      this.groupForm.set({
        code: '',
        nom: '',
        description: '',
        actif: true
      });
    }
    this.showForm.set(true);
  }

  saveGroup(): void {
    const form = this.groupForm();
    if (!form.code || !form.nom) {
      this.error.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.success.set('Groupe enregistré avec succès');
    this.showForm.set(false);
    this.loadGroups();
  }

  deleteGroup(id: string): void {
    if (confirm('Confirmer la suppression de ce groupe?')) {
      this.groups.update(grps => grps.filter(g => g.id !== id));
      this.success.set('Groupe supprimé');
    }
  }

  toggleStatus(group: EmployeeGroup): void {
    group.actif = !group.actif;
    this.success.set(`Groupe ${group.actif ? 'activé' : 'désactivé'}`);
  }

  updateGroupForm<K extends keyof EmployeeGroupForm>(field: K, value: EmployeeGroupForm[K]): void {
    this.groupForm.update(form => ({ ...form, [field]: value }));
  }
}
