import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Employee {
  matricule: string;
  nom: string;
  prenom: string;
  departement?: string;
  poste?: string;
  dateEmbauche?: string;
  actif: boolean;
}

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-management.component.html',
})
export class EmployeeManagementComponent implements OnInit {
  employees = signal<Employee[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Filters
  searchTerm = signal('');
  filterDepartement = signal('');
  filterActif = signal('all');

  // Form
  showForm = signal(false);
  editingEmployee = signal<Employee | null>(null);
  employeeForm = signal<Employee>({
    matricule: '',
    nom: '',
    prenom: '',
    departement: '',
    poste: '',
    dateEmbauche: '',
    actif: true
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading.set(true);
    // Simulated data - in production, this would call an API
    setTimeout(() => {
      this.employees.set([
        { matricule: 'EMP001', nom: 'Dupont', prenom: 'Jean', departement: 'IT', poste: 'Développeur', actif: true },
        { matricule: 'EMP002', nom: 'Martin', prenom: 'Marie', departement: 'RH', poste: 'Manager', actif: true },
        { matricule: 'EMP003', nom: 'Bernard', prenom: 'Pierre', departement: 'Finance', poste: 'Comptable', actif: false },
      ]);
      this.loading.set(false);
    }, 500);
  }

  filteredEmployees() {
    return this.employees().filter(emp => {
      const matchesSearch = !this.searchTerm() ||
        emp.nom.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        emp.prenom.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        emp.matricule.toLowerCase().includes(this.searchTerm().toLowerCase());

      const matchesDept = !this.filterDepartement() ||
        emp.departement === this.filterDepartement();

      const matchesActif = this.filterActif() === 'all' ||
        (this.filterActif() === 'actif' && emp.actif) ||
        (this.filterActif() === 'inactif' && !emp.actif);

      return matchesSearch && matchesDept && matchesActif;
    });
  }

  openForm(employee?: Employee): void {
    if (employee) {
      this.editingEmployee.set(employee);
      this.employeeForm.set({ ...employee });
    } else {
      this.editingEmployee.set(null);
      this.employeeForm.set({
        matricule: '',
        nom: '',
        prenom: '',
        departement: '',
        poste: '',
        dateEmbauche: '',
        actif: true
      });
    }
    this.showForm.set(true);
  }

  saveEmployee(): void {
    const form = this.employeeForm();
    if (!form.matricule || !form.nom || !form.prenom) {
      this.error.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // In production, this would call an API
    this.success.set('Employé enregistré avec succès');
    this.showForm.set(false);
    this.loadEmployees();
  }

  deleteEmployee(matricule: string): void {
    if (confirm('Confirmer la suppression de cet employé?')) {
      // In production, this would call an API
      this.employees.update(emps => emps.filter(e => e.matricule !== matricule));
      this.success.set('Employé supprimé');
    }
  }

  toggleStatus(employee: Employee): void {
    employee.actif = !employee.actif;
    this.success.set(`Employé ${employee.actif ? 'activé' : 'désactivé'}`);
  }

  getDepartements(): string[] {
    return [...new Set(this.employees().map(e => e.departement).filter((d): d is string => !!d))];
  }

  updateEmployeeForm<K extends keyof Employee>(field: K, value: Employee[K]): void {
    this.employeeForm.update(form => ({ ...form, [field]: value } as Employee));
  }
}
