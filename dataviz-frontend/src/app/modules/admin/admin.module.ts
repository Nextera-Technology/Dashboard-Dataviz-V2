import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';
const routes: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'user-management',
        loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      // Dashboard Builder Sub-menu routes
      {
        path: 'dashboard-list',
        loadComponent: () => import('./pages/dashboard-list/dashboard-list.component').then(m => m.DashboardListComponent)
      },
      {
        path: 'dashboard-create',
        loadComponent: () => import('./pages/dashboard-create/dashboard-create.component').then(m => m.DashboardCreateComponent)
      },
      {
        path: 'dashboard-table',
        loadComponent: () => import('./pages/dashboard-table/dashboard-table.component').then(m => m.DashboardTableComponent)
      },
      // Job Description Sub-menu routes
      {
        path: 'job-description',
        loadComponent: () => import('./pages/job-description-list/job-description-list.component').then(m => m.JobDescriptionListComponent)
      },
      {
        path: 'job-description-create',
        loadComponent: () => import('./pages/job-description-create/job-description-create.component').then(m => m.JobDescriptionCreateComponent)
      },
      {
        path: 'job-description-table',
        loadComponent: () => import('./pages/job-description-table/job-description-table.component').then(m => m.JobDescriptionTableComponent)
      },
      // Existing routes
      {
        path: 'dashboard-builder/:id',
        loadComponent: () => import('./pages/dashboard-builder/dashboard-builder.component').then(m => m.DashboardBuilderComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard-list',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminModule { } 