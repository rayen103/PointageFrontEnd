import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeviceManagementService, DeviceDto } from '../../services/device-management.service';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
  ],
  templateUrl: './device-list.component.html'
})
export class DeviceListComponent implements OnInit {
  private deviceService = inject(DeviceManagementService);

  devices = signal<DeviceDto[]>([]);
  filteredDevices = signal<DeviceDto[]>([]);
  loading = signal(false);
  searchText = '';
  onlineCount = signal(0);
  offlineCount = signal(0);

  ngOnInit(): void {
    this.loading.set(true);
    this.deviceService.getAllDevices('SOC001').subscribe({
      next: (ds) => {
        this.devices.set(ds);
        this.filteredDevices.set(ds);
        this.updateStats();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private updateStats(): void {
    const all = this.devices();
    // Placeholder: update based on actual device status from backend
    this.onlineCount.set(0);
    this.offlineCount.set(all.length);
  }

  filterDevices(): void {
    const term = (this.searchText || '').toLowerCase();
    const all = this.devices();
    this.updateStats();
    this.filteredDevices.set(
      all.filter(d =>
        (d.terminal || '').toLowerCase().includes(term) ||
        (d.ip || '').toLowerCase().includes(term) ||
        (d.service || '').toLowerCase().includes(term) ||
        String(d.id || '').toLowerCase().includes(term)
      )
    );
  }
testConnection(device: DeviceDto): void {
    // TODO: Implement connection test via device-management.service
    console.log('Testing connection to device:', device.ip);
  }

  syncDevice(device: DeviceDto): void {
    // TODO: Implement device sync via device-management.service
    console.log('Syncing device:', device.terminal);
  }

  editDevice(device: DeviceDto): void {
    // TODO: Open dialog to edit device details
    console.log('Edit device:', device.terminal);
  }

  deleteDevice(device: DeviceDto): void {
    // TODO: Implement device deletion via device-management.service
    console.log('Delete device:', device.terminal);
  }

  addDevice(): void {
    // TODO: Open dialog to create new device
    console.log('Add new device');
  }
}
