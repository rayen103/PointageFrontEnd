import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

type TableInfo = {
  tableName: string;
  entityName: string;
  rowCount: number;
  dbSetProperty: string;
};

type TableListResponse = {
  totalTables: number;
  tables: TableInfo[];
};

type TableDataResponse = {
  tableName: string;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: any[];
};

type TableStructureResponse = {
  tableName: string;
  entityName: string;
  columnCount: number;
  columns: Array<{
    name: string;
    type: string;
    fullType: string;
    isNullable: boolean;
    underlyingType: string;
  }>;
};

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explorer.component.html'
})
export class ExplorerComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly apiBaseUrl = 'http://localhost:5000';

  readonly loadingTables = signal(false);
  readonly tablesError = signal<string | null>(null);
  readonly tables = signal<TableInfo[]>([]);
  readonly selectedTable = signal<string | null>(null);

  readonly loadingData = signal(false);
  readonly dataError = signal<string | null>(null);
  readonly tableData = signal<any[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(50);
  readonly totalCount = signal(0);
  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

  readonly loadingStructure = signal(false);
  readonly structureError = signal<string | null>(null);
  readonly tableStructure = signal<TableStructureResponse | null>(null);
  readonly showStructure = signal(false);

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.loadingTables.set(true);
    this.tablesError.set(null);

    this.http
      .get<TableListResponse>(`${this.apiBaseUrl}/api/databaseexplorer/tables`)
      .subscribe({
        next: (response) => {
          this.tables.set(response.tables);
          this.loadingTables.set(false);
        },
        error: (err) => {
          this.tablesError.set(err?.message ?? 'Failed to load tables');
          this.loadingTables.set(false);
        }
      });
  }

  selectTable(tableName: string): void {
    this.selectedTable.set(tableName);
    this.currentPage.set(1);
    this.loadTableData(tableName, 1);
    this.loadTableStructure(tableName);
  }

  loadTableData(tableName: string, page: number): void {
    this.loadingData.set(true);
    this.dataError.set(null);

    this.http
      .get<TableDataResponse>(`${this.apiBaseUrl}/api/databaseexplorer/table/${tableName}`, {
        params: { page: page.toString(), pageSize: this.pageSize().toString() }
      })
      .subscribe({
        next: (response) => {
          this.tableData.set(response.data);
          this.totalCount.set(response.totalCount);
          this.currentPage.set(response.page);
          this.loadingData.set(false);
        },
        error: (err) => {
          this.dataError.set(err?.message ?? 'Failed to load table data');
          this.loadingData.set(false);
        }
      });
  }

  loadTableStructure(tableName: string): void {
    this.loadingStructure.set(true);
    this.structureError.set(null);

    this.http
      .get<TableStructureResponse>(`${this.apiBaseUrl}/api/databaseexplorer/table/${tableName}/structure`)
      .subscribe({
        next: (response) => {
          this.tableStructure.set(response);
          this.loadingStructure.set(false);
        },
        error: (err) => {
          this.structureError.set(err?.message ?? 'Failed to load table structure');
          this.loadingStructure.set(false);
        }
      });
  }

  goToPage(page: number): void {
    const tableName = this.selectedTable();
    if (tableName && page >= 1 && page <= this.totalPages()) {
      this.loadTableData(tableName, page);
    }
  }

  getTableDataKeys(data: any[]): string[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }
}

