import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard'
    },
    {
        path: 'charts',
        loadComponent: () => import('./modules/charts/charts.component').then(m => m.ChartsComponent),
        title: 'Charts'
    },
    {
        path: 'analytics',
        loadComponent: () => import('./modules/analytics/analytics.component').then(m => m.AnalyticsComponent),
        title: 'Analytics'
    },
    {
        path: '**',
        redirectTo: '/dashboard'
    }
]; 