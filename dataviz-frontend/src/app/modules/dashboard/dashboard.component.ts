import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { TranslationService } from 'app/shared/services/translation/translation.service';

import { AuthService, User } from '../../core/auth/auth.service';
import { DashboardService, DashboardData, FilterData, CertificationFilter, SectionFilter, Section } from '../../shared/services/dashboard.service';
import { SectionComponent } from '../../shared/components/sections/section.component';
import { DashboardBuilderService } from '../admin/pages/dashboard-builder/dashboard-builder.service';
import { ShareDataService } from 'app/shared/services/share-data.service';

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
    TranslatePipe,
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
  dashboardOriginal = null;
  filters: FilterData | null = null;
  // dashboards = [];
  certificationSearch: string = '';
  selectedCertificationsCount: number = 0;
  selectedSectionsCount: number = 0;
  dashboardId: string | null = null;

  langMenuOpen = false;

  // Filter data
  certifications: CertificationFilter[] = [];
  sections: SectionFilter[] = [];
  sectionsList: Section[] = [];
  sectionSelections: boolean[] = [];
  selectedSections: string[] = [];

  get filteredCertifications() {
    if (!this.certificationSearch) {
      return this.certifications;
    }
    return this.certificateList.filter(cert => 
      cert.name.toLowerCase().includes(this.certificationSearch.toLowerCase())
    );
  }

  certificateList = [
    { name: "RDC 2021", children: [], expanded: false  },
    { name: "RDC 2022", children: ["Classe 2022", "Classe Excellence 2022"], expanded: false  },
    { name: "RDC 2023", children: [] , expanded: false },
    { name: "RDC 2024", children: [] , expanded: false },
    { name: "RDC 2025", children: [] , expanded: false },
    { name: "Classe 2022", children: [] , expanded: false },
    { name: "Classe Excellence 2022", children: [], expanded: false  },
    { name: "CDRH 2022", children: [], expanded: false  },
    { name: "CDRH 2023", children: [] , expanded: false },
    { name: "CDRH 2024", children: [], expanded: false  },
    { name: "CDRH 2025", children: [] , expanded: false },
    { name: "CPEB 2021", children: [] , expanded: false },
    { name: "CPEB 2022", children: [], expanded: false  },
    { name: "CPEB 2023", children: [], expanded: false  },
    { name: "CPEB 2024", children: [], expanded: false  },
    { name: "CPEB 2025", children: [] , expanded: false }
   ];

  selectedChildren: { [key: string]: boolean } = {};

getChildModel(childName: string): boolean {
  if (this.selectedChildren[childName] === undefined) {
    this.selectedChildren[childName] = false;
  }
  return this.selectedChildren[childName];
}

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardBuilderService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private notifier: NotificationService,
    private shareDataService: ShareDataService
    ,
    public translation: TranslationService
  ) {
    shareDataService.setIsDashboard(true);
  }

  setLanguage(lang: string): void {
    this.translation.setLanguage(lang);
    const msg = this.translation.translate('shared.language_changed') || 'Language changed';
    this.snackBar.open(msg, 'Close', { duration: 1500 });
    this.langMenuOpen = false;
  }

  @HostListener('document:click')
  closeLangMenu(): void {
    this.langMenuOpen = false;
  }

  openLangMenu(event: Event): void {
    event.stopPropagation();
    this.langMenuOpen = !this.langMenuOpen;
  }

  currentFlag(): string {
    const lang = this.translation.getCurrentLanguage?.() || this.translation.getCurrentLanguage();
    if (lang === 'fr') return 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/fr.svg';
    return 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/gb.svg';
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.dashboardId = this.shareDataService.getDashboardId();

    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadDashboards();
  }

  async loadDashboards() {
    try {
      const filter = {};
      const result = await this.dashboardService.getOneDashboard(this.dashboardId);
      if (result) {
        this.dashboardOriginal = result;
        this.dashboard = { ...this.dashboardOriginal };
        if(this.dashboardOriginal && this.dashboardOriginal.sectionIds) {
          this.sectionsList = this.dashboardOriginal.sectionIds || [];
          this.sectionsList.forEach(section => {
            this.selectedSections.push(section.name);
          });
          this.updateSelectionCounts();
        }
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
    // this.filteredCertifications = this.certificateList.filter(cert => {
    //   return cert.name.toLowerCase().includes(this.certificationSearch.toLowerCase());
    // });
  }

  toggleCertificationSelectAll(): void {
    const allSelected = this.certifications.every(cert => cert.selected);
    this.certifications.forEach(cert => {
      cert.selected = !allSelected;
    });
    this.updateCounts();
  }

  async applyCertificationFilters(): Promise<void> {
    await this.notifier.toastKey('notifications.filters_applied', 'success', undefined, 2000);
  }

  async applySectionFilters(): Promise<void> {
    if (this.selectedSections.length === 0) {
      this.dashboard = this.dashboardOriginal;
      return;
    }
  this.dashboard = {
    ...this.dashboard,
    sectionIds: this.dashboardOriginal.sectionIds.filter(
      (section: Section) => this.selectedSections.includes(section.name)
    )
  };
    await this.notifier.toastKey('notifications.filters_applied', 'success', undefined, 2000);
  }

  updateCounts(): void {
    this.selectedCertificationsCount = this.certifications.filter(cert => cert.selected).length;
  }

  updateSelectionCounts(){
    this.selectedSectionsCount = this.selectedSections.length;
  }

  onCheckboxChange(item: string, isChecked: boolean) {
    if (isChecked) {
      this.selectedSections.push(item);
    } else {
      this.selectedSections = this.selectedSections.filter(i => i !== item);
    }
    this.updateSelectionCounts();
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.notifier.successKey('notifications.logged_out');
    this.router.navigate(['/auth/login']);
  }

  isAdminUser(): boolean {
    return this.currentUser?.role === 'operator';
  }
} 