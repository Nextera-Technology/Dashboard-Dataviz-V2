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
      {
        path: 'dashboard-list',
        loadComponent: () => import('./pages/dashboard-list/dashboard-list.component').then(m => m.DashboardListComponent)
      },
      {
        path: 'job-description',
        loadComponent: () => import('./pages/job-description-list/job-description-list.component').then(m => m.JobDescriptionListComponent)
      },
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