import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'pointage',
    loadComponent: () => import('./components/layouts/pointage-layout.component').then(m => m.PointageLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/pointage/pointage.component').then(m => m.PointageComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'devices',
        loadComponent: () => import('./components/devices/device-list.component').then(m => m.DeviceListComponent)
      },
      {
        path: 'schedules',
        loadComponent: () => import('./components/schedules/schedule-list.component').then(m => m.ScheduleListComponent)
      },
      {
        path: 'schedules/shift-management',
        loadComponent: () => import('./components/schedules/shift-management.component').then(m => m.ShiftManagementComponent)
      },
      {
        path: 'schedules/team-management',
        loadComponent: () => import('./components/schedules/team-management.component').then(m => m.TeamManagementComponent)
      },
      {
        path: 'schedules/planning-calendar',
        loadComponent: () => import('./components/schedules/planning-calendar.component').then(m => m.PlanningCalendarComponent)
      },
      {
        path: 'schedules/employee-shift-assignment',
        loadComponent: () => import('./components/schedules/employee-shift-assignment.component').then(m => m.EmployeeShiftAssignmentComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./components/attendance/attendance-dashboard.component').then(m => m.AttendanceDashboardComponent)
      },
      {
        path: 'attendance/daily',
        loadComponent: () => import('./components/attendance/attendance-daily.component').then(m => m.AttendanceDailyComponent)
      },
      {
        path: 'attendance/grid',
        loadComponent: () => import('./components/attendance/attendance-grid.component').then(m => m.AttendanceGridComponent)
      },
      {
        path: 'attendance/validation',
        loadComponent: () => import('./components/attendance/attendance-validation.component').then(m => m.AttendanceValidationComponent)
      },
      {
        path: 'attendance/batch-processing',
        loadComponent: () => import('./components/attendance/batch-processing.component').then(m => m.BatchProcessingComponent)
      },
      {
        path: 'attendance/absence-marking',
        loadComponent: () => import('./components/attendance/absence-marking.component').then(m => m.AbsenceMarkingComponent)
      },
      {
        path: 'attendance/import',
        loadComponent: () => import('./components/attendance/import-attendance.component').then(m => m.ImportAttendanceComponent)
      },
      {
        path: 'attendance/night-shift',
        loadComponent: () => import('./components/attendance/night-shift-processing.component').then(m => m.NightShiftProcessingComponent)
      },
      {
        path: 'attendance/day-closure',
        loadComponent: () => import('./components/attendance/day-closure.component').then(m => m.DayClosureComponent)
      },
      {
        path: 'attendance/error-dashboard',
        loadComponent: () => import('./components/attendance/error-dashboard.component').then(m => m.ErrorDashboardComponent)
      },
      {
        path: 'attendance/error-processing',
        loadComponent: () => import('./components/attendance/error-processing.component').then(m => m.ErrorProcessingComponent)
      },
      {
        path: 'attendance/adjustment-audit',
        loadComponent: () => import('./components/attendance/adjustment-audit.component').then(m => m.AdjustmentAuditComponent)
      },
      {
        path: 'attendance/adjustment-history',
        loadComponent: () => import('./components/attendance/adjustment-history.component').then(m => m.AdjustmentHistoryComponent)
      },
      {
        path: 'attendance/automatic-adjustment',
        loadComponent: () => import('./components/attendance/automatic-adjustment.component').then(m => m.AutomaticAdjustmentComponent)
      },
      {
        path: 'attendance/manual-adjustment',
        loadComponent: () => import('./components/attendance/manual-adjustment.component').then(m => m.ManualAdjustmentComponent)
      },
      {
        path: 'overtime',
        loadComponent: () => import('./components/overtime/overtime-summary.component').then(m => m.OvertimeSummaryComponent)
      },
      {
        path: 'payroll/transfer',
        loadComponent: () => import('./components/payroll/payroll-transfer.component').then(m => m.PayrollTransferComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/report-selection.component').then(m => m.ReportSelectionComponent)
      },
      {
        path: 'reports/presence',
        loadComponent: () => import('./components/reports/presence-report.component').then(m => m.PresenceReportComponent)
      },
      {
        path: 'reports/department',
        loadComponent: () => import('./components/reports/department-report.component').then(m => m.DepartmentReportComponent)
      },
      {
        path: 'reports/overtime',
        loadComponent: () => import('./components/reports/overtime-report.component').then(m => m.OvertimeReportComponent)
      },
      {
        path: 'reports/delay',
        loadComponent: () => import('./components/reports/delay-report.component').then(m => m.DelayReportComponent)
      },
      {
        path: 'reports/leave',
        loadComponent: () => import('./components/reports/leave-report.component').then(m => m.LeaveReportComponent)
      },
      {
        path: 'reports/export',
        loadComponent: () => import('./components/reports/report-export.component').then(m => m.ReportExportComponent)
      },
      {
        path: 'reports/weekly-anomalies',
        loadComponent: () => import('./components/reports/weekly-anomalies.component').then(m => m.WeeklyAnomaliesComponent)
      },
      {
        path: 'configuration/system-parameters',
        loadComponent: () => import('./components/configuration/system-parameters.component').then(m => m.SystemParametersComponent)
      },
      {
        path: 'configuration/work-posts',
        loadComponent: () => import('./components/work-posts/work-post-management.component').then(m => m.WorkPostManagementComponent)
      },
      {
        path: 'configuration/overtime-tiers',
        loadComponent: () => import('./components/overtime-tiers/overtime-tier-management.component').then(m => m.OvertimeTierManagementComponent)
      },
      {
        path: 'configuration/post-assignments',
        loadComponent: () => import('./components/post-assignment/post-assignment-management.component').then(m => m.PostAssignmentManagementComponent)
      },
      {
        path: 'configuration/user-access',
        loadComponent: () => import('./components/user-access/user-access-management.component').then(m => m.UserAccessManagementComponent)
      },
      {
        path: 'configuration/motive-management',
        loadComponent: () => import('./components/configuration/motive-management.component').then(m => m.MotiveManagementComponent)
      },
      {
        path: 'configuration/employees',
        loadComponent: () => import('./components/configuration/employee-management.component').then(m => m.EmployeeManagementComponent)
      },
      {
        path: 'configuration/employee-groups',
        loadComponent: () => import('./components/configuration/employee-group-management.component').then(m => m.EmployeeGroupManagementComponent)
      },
      {
        path: 'configuration/problematic-employees',
        loadComponent: () => import('./components/configuration/problematic-employees.component').then(m => m.ProblematicEmployeesComponent)
      },
      {
        path: 'attendance/exit-authorization',
        loadComponent: () => import('./components/attendance/exit-authorization.component').then(m => m.ExitAuthorizationComponent)
      },
      {
        path: 'attendance/meal-allowance-premiums',
        loadComponent: () => import('./components/attendance/meal-allowance-premiums.component').then(m => m.MealAllowancePremiumsComponent)
      },
      {
        path: 'attendance/daily-entry-exit-identification',
        loadComponent: () => import('./components/attendance/daily-entry-exit-identification.component').then(m => m.DailyEntryExitIdentificationComponent)
      }
    ]
  },
  // Explorer stays at top level (shared utility)
  {
    path: 'explorer',
    loadComponent: () => import('./components/explorer/explorer.component').then(m => m.ExplorerComponent)
  }
];
