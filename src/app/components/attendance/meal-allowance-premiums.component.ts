import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MealAllowance {
  id: number;
  matricule: string;
  employeeName: string;
  month: string;
  year: number;
  workingDays: number;
  mealDays: number;
  premiumAmount: number;
  totalAmount: number;
  status: 'calculated' | 'approved' | 'transferred';
  department: string;
}

interface AllowanceRule {
  id: number;
  name: string;
  dailyAmount: number;
  workingHoursRequired: number;
  isActive: boolean;
}

@Component({
  selector: 'app-meal-allowance-premiums',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meal-allowance-premiums.component.html'
})
export class MealAllowancePremiumsComponent {
  // Signals for reactive state
  allowances = signal<MealAllowance[]>([
    {
      id: 1,
      matricule: 'EMP001',
      employeeName: 'Ahmed Benali',
      month: 'December',
      year: 2025,
      workingDays: 22,
      mealDays: 20,
      premiumAmount: 50,
      totalAmount: 1000,
      status: 'calculated',
      department: 'IT'
    },
    {
      id: 2,
      matricule: 'EMP002',
      employeeName: 'Sara Mansouri',
      month: 'December',
      year: 2025,
      workingDays: 22,
      mealDays: 22,
      premiumAmount: 50,
      totalAmount: 1100,
      status: 'approved',
      department: 'HR'
    },
    {
      id: 3,
      matricule: 'EMP003',
      employeeName: 'Mohamed Alami',
      month: 'December',
      year: 2025,
      workingDays: 22,
      mealDays: 18,
      premiumAmount: 50,
      totalAmount: 900,
      status: 'transferred',
      department: 'Finance'
    }
  ]);

  allowanceRules = signal<AllowanceRule[]>([
    { id: 1, name: 'Standard Meal Allowance', dailyAmount: 50, workingHoursRequired: 8, isActive: true },
    { id: 2, name: 'Overtime Meal Allowance', dailyAmount: 75, workingHoursRequired: 10, isActive: true },
    { id: 3, name: 'Night Shift Meal', dailyAmount: 60, workingHoursRequired: 8, isActive: true }
  ]);

  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());
  filterDepartment = signal<string>('all');
  filterStatus = signal<string>('all');
  searchTerm = signal<string>('');

  showCalculateModal = signal<boolean>(false);
  showRulesModal = signal<boolean>(false);
  showEditRuleModal = signal<boolean>(false);
  
  selectedRule = signal<AllowanceRule | null>(null);
  newRule = signal({
    name: '',
    dailyAmount: 0,
    workingHoursRequired: 8
  });

  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  filteredAllowances() {
    return this.allowances().filter(allowance => {
      const deptMatch = this.filterDepartment() === 'all' || allowance.department === this.filterDepartment();
      const statusMatch = this.filterStatus() === 'all' || allowance.status === this.filterStatus();
      const searchMatch = !this.searchTerm() || 
        allowance.matricule.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        allowance.employeeName.toLowerCase().includes(this.searchTerm().toLowerCase());
      
      return deptMatch && statusMatch && searchMatch;
    });
  }

  stats() {
    const all = this.allowances();
    return {
      total: all.length,
      totalAmount: all.reduce((sum, a) => sum + a.totalAmount, 0),
      avgAmount: all.length > 0 ? all.reduce((sum, a) => sum + a.totalAmount, 0) / all.length : 0,
      calculated: all.filter(a => a.status === 'calculated').length,
      approved: all.filter(a => a.status === 'approved').length,
      transferred: all.filter(a => a.status === 'transferred').length
    };
  }

  calculateAllowances() {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.successMessage.set(`Meal allowances calculated for ${this.selectedMonth()}/${this.selectedYear()}`);
      this.isLoading.set(false);
      this.showCalculateModal.set(false);
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 1500);
  }

  approveAllowances() {
    const calculated = this.allowances().filter(a => a.status === 'calculated');
    if (calculated.length === 0) {
      this.errorMessage.set('No calculated allowances to approve');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.allowances.update(allowances =>
      allowances.map(a => a.status === 'calculated' ? { ...a, status: 'approved' as const } : a)
    );

    this.successMessage.set(`${calculated.length} allowances approved successfully`);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  transferToPayroll() {
    const approved = this.allowances().filter(a => a.status === 'approved');
    if (approved.length === 0) {
      this.errorMessage.set('No approved allowances to transfer');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.allowances.update(allowances =>
      allowances.map(a => a.status === 'approved' ? { ...a, status: 'transferred' as const } : a)
    );

    this.successMessage.set(`${approved.length} allowances transferred to payroll`);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  exportToExcel() {
    this.successMessage.set('Exporting to Excel...');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  openCalculateModal() {
    this.showCalculateModal.set(true);
  }

  closeCalculateModal() {
    this.showCalculateModal.set(false);
  }

  openRulesModal() {
    this.showRulesModal.set(true);
  }

  closeRulesModal() {
    this.showRulesModal.set(false);
  }

  openEditRuleModal(rule: AllowanceRule) {
    this.selectedRule.set(rule);
    this.showEditRuleModal.set(true);
  }

  closeEditRuleModal() {
    this.showEditRuleModal.set(false);
    this.selectedRule.set(null);
  }

  saveRule() {
    const rule = this.selectedRule();
    if (!rule) return;

    this.allowanceRules.update(rules =>
      rules.map(r => r.id === rule.id ? rule : r)
    );

    this.successMessage.set('Rule updated successfully');
    this.closeEditRuleModal();
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  toggleRuleStatus(rule: AllowanceRule) {
    this.allowanceRules.update(rules =>
      rules.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r)
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'calculated': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'calculated': return '📊';
      case 'approved': return '✅';
      case 'transferred': return '💰';
      default: return '❓';
    }
  }
}
