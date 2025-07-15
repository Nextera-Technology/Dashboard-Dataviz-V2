import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService, User } from '../../core/auth/auth.service';
import { DashboardService, DashboardData, FilterData, CertificationFilter, SectionFilter } from '../../shared/services/dashboard.service';
import { SectionComponent } from '../../shared/components/sections/section.component';
import { DashboardBuilderService } from '../admin/pages/dashboard-builder/dashboard-builder.service';

declare var am5: any;
declare var am5xy: any;
declare var am5percent: any;
declare var am5map: any;
declare var am5geodata_worldLow: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSnackBarModule,
    SectionComponent
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('userActivityChart') userActivityChartRef!: ElementRef;
  @ViewChild('geoChart') geoChartRef!: ElementRef;

  currentUser: User | null = null;
  dashboard = null;
  filters: FilterData | null = null;
  dashboards = [];
  certificationSearch: string = '';
  selectedCertificationsCount: number = 0;
  selectedSectionsCount: number = 0;

  // Filter data
  certifications: CertificationFilter[] = [];
  sections: SectionFilter[] = [];

  get filteredCertifications() {
    if (!this.certificationSearch) {
      return this.certifications;
    }
    return this.certifications.filter(cert => 
      cert.name.toLowerCase().includes(this.certificationSearch.toLowerCase())
    );
  }

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Load filter data
    // this.dashboardService.getFilters().subscribe(filters => {
    //   this.filters = filters;
    //   this.certifications = filters.certifications;
    //   this.sections = filters.sections;
    //   this.updateCounts();
    // });
    this.loadDashboards();
  }

  async loadDashboards() {
    try {
      const filter = {};
      const result =
        await this.dashboardService.getAllDashboards(filter);
      if (result?.data) {
        this.dashboard = result?.data[0];
        this.dashboards = result?.data;
        console.log("Dashboards loaded:", this.dashboard);
      }
    } catch (error) {
      console.error("Error loading dashboards:", error);
    }
  }

  ngAfterViewInit(): void {
    // Chart initialization can be added here when needed
  }

  trackBySection(index: number, section: any): string {
    return section._id;
  }

  onCertificationSearch(): void {
    console.log('Certification search:', this.certificationSearch);
  }

  toggleCertificationSelectAll(): void {
    const allSelected = this.certifications.every(cert => cert.selected);
    this.certifications.forEach(cert => {
      cert.selected = !allSelected;
    });
    this.updateCounts();
  }

  applyCertificationFilters(): void {
    console.log('Applying certification filters');
    this.snackBar.open('Certification filters applied', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  applySectionFilters(): void {
    console.log('Applying section filters');
    this.snackBar.open('Section filters applied', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  updateCounts(): void {
    this.selectedCertificationsCount = this.certifications.filter(cert => cert.selected).length;
    this.selectedSectionsCount = this.sections.filter(section => section.selected).length;
  }

  logout(): void {
    this.authService.logout();
    this.snackBar.open('Logged out successfully', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.router.navigate(['/auth/login']);
  }

  isAdminUser(): boolean {
    return this.currentUser?.role === 'operator';
  }
} 