import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../types/nav-item';

@Component({
  selector: 'app-pointage-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './pointage-layout.component.html',
  styleUrls: ['./pointage-layout.component.scss']
})
export class PointageLayoutComponent {
  mobileMenuOpen = signal(false);
  
  navItems: NavItem[] = [
    { label: 'Accueil', path: '/', icon: '🏠' },
    { label: 'Tableau de Bord', path: '/pointage/dashboard', icon: '📊' },
    { label: 'Pointage', path: '/pointage', icon: '⏰' },
    { label: 'Présence', path: '/pointage/attendance', icon: '✅' },
    { label: 'Import', path: '/pointage/attendance/import', icon: '📥' },
    { label: 'Terminaux', path: '/pointage/devices', icon: '📱' },
    { label: 'Horaires', path: '/pointage/schedules', icon: '📅' },
    { label: 'Heures Supp.', path: '/pointage/overtime', icon: '⏱️' },
    { label: 'Transfert Paie', path: '/pointage/payroll/transfer', icon: '💼' },
    { label: 'Rapports', path: '/pointage/reports', icon: '📈' },
    { label: 'Configuration', path: '/pointage/configuration/system-parameters', icon: '⚙️' },
  ];
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }
}
