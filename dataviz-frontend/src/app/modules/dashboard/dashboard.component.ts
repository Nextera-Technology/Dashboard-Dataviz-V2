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
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule,
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

  // New properties for section visibility and navigation
  sectionVisibility: { [key: string]: boolean } = {}; // For frozen header navigation
  sidebarSectionVisibility: { [key: string]: boolean } = {}; // For sidebar filter (pending state)
  visibleSections: Section[] = [];

  // Sidebar collapse state
  isSidebarCollapsed: boolean = false;

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
    const closeLabel = this.translation.translate('shared.close') || 'Close';
    this.snackBar.open(msg, closeLabel, { duration: 1500 });
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

    this.loadSidebarState();
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
            // Initialize all sections as visible by default
            this.sectionVisibility[section._id] = true;
            this.sidebarSectionVisibility[section._id] = true;
          });
          this.updateVisibleSections();
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
    // Apply sidebar changes to main visibility state
    Object.keys(this.sidebarSectionVisibility).forEach(sectionId => {
      const wasVisible = this.sectionVisibility[sectionId];
      const willBeVisible = this.sidebarSectionVisibility[sectionId];
      
      this.sectionVisibility[sectionId] = willBeVisible;
      
      // If section is being shown, scroll to it (only for the first one)
      if (willBeVisible && !wasVisible) {
        const firstNewlyVisible = Object.keys(this.sidebarSectionVisibility)
          .find(id => this.sidebarSectionVisibility[id] && !this.sectionVisibility[id]);
        if (sectionId === firstNewlyVisible) {
          setTimeout(() => {
            this.scrollToSection(sectionId);
          }, 100);
        }
      }
    });
    
    // Update visible sections
    this.updateVisibleSections();
    
    // If no sections are visible, scroll to top
    if (this.visibleSections.length === 0) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // Scroll to first visible section if current view has no visible sections
      const hasVisibleInView = this.visibleSections.some(section => {
        const element = document.getElementById(`section-${section._id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }
        return false;
      });
      
      if (!hasVisibleInView) {
        setTimeout(() => {
          this.scrollToFirstVisibleSection();
        }, 100);
      }
    }
    
    await this.notifier.toastKey('notifications.filters_applied', 'success', undefined, 2000);
  }

  updateCounts(): void {
    this.selectedCertificationsCount = this.certifications.filter(cert => cert.selected).length;
  }

  updateSelectionCounts(){
    this.selectedSectionsCount = this.selectedSections.length;
  }
  
  // Get count of visible sections for sidebar display
  getVisibleSectionsCount(): number {
    return Object.values(this.sidebarSectionVisibility).filter(visible => visible).length;
  }
  
  // Sync selectedSections array from visibility state
  syncSelectedSectionsFromVisibility(): void {
    this.selectedSections = this.sectionsList
      .filter(section => this.sectionVisibility[section._id])
      .map(section => section.name);
    
    this.updateSelectionCounts();
  }

  // Legacy method - kept for compatibility but now redirects to new method
  onCheckboxChange(item: string, isChecked: boolean) {
    const section = this.sectionsList.find(s => s.name === item);
    if (section) {
      this.onSidebarCheckboxChange(section._id, isChecked);
    }
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.notifier.successKey('notifications.logged_out');
    this.router.navigate(['/auth/login']);
  }

  isAdminUser(): boolean {
    return this.currentUser?.role === 'operator';
  }

  isJobDescriptionDashboard(): boolean {
    return this.dashboard?.typeOfUsage === 'JOB_DESCRIPTION_EVALUATION';
  }

  getDataSourceDisplay(): string {
    if (this.dashboard?.sources && this.dashboard.sources.length > 0) {
      return this.dashboard.sources.map((source: any) => {
        const certification = source.certification || '';
        const classes = source.classes && source.classes.length > 0 
          ? source.classes.join(', ') 
          : '';
        
        if (certification && classes) {
          return `${certification} - ${classes}`;
        } else if (certification) {
          return certification;
        } else if (classes) {
          return classes;
        }
        return '';
      }).filter((item: string) => item).join(' | ');
    }
    
    // Fallback to translation key if no sources
    return this.translation.translate('admin.dashboardBuilder.data_source_label') || 'Data Source';
  }

  // Toggle section visibility from frozen header
  toggleSectionVisibility(sectionId: string, event: any): void {
    const isChecked = event.target.checked;
    const wasVisible = this.sectionVisibility[sectionId];
    
    // Update both visibility states immediately
    this.sectionVisibility[sectionId] = isChecked;
    this.sidebarSectionVisibility[sectionId] = isChecked;
    
    // Update visible sections and selected sections for sidebar
    this.updateVisibleSections();
    this.syncSelectedSectionsFromVisibility();
    
    if (isChecked && !wasVisible) {
      // Section is being shown - scroll to it
      setTimeout(() => {
        this.scrollToSection(sectionId);
      }, 100); // Small delay to ensure DOM is updated
    } else if (!isChecked && wasVisible) {
      // Section is being hidden - scroll to first visible section
      setTimeout(() => {
        this.scrollToFirstVisibleSection();
      }, 100);
    }
  }
  
  // Handle sidebar checkbox changes (pending state)
  onSidebarCheckboxChange(sectionId: string, isChecked: boolean): void {
    this.sidebarSectionVisibility[sectionId] = isChecked;
    
    // Update selectedSections array for sidebar count
    const section = this.sectionsList.find(s => s._id === sectionId);
    if (section) {
      if (isChecked) {
        if (!this.selectedSections.includes(section.name)) {
          this.selectedSections.push(section.name);
        }
      } else {
        this.selectedSections = this.selectedSections.filter(name => name !== section.name);
      }
    }
    
    this.updateSelectionCounts();
  }
  
  // Update visible sections array
  updateVisibleSections(): void {
    if (this.dashboard?.sectionIds) {
      this.visibleSections = this.dashboard.sectionIds.filter(
        (section: Section) => this.sectionVisibility[section._id]
      );
    }
  }
  
  // Scroll to specific section
  scrollToSection(sectionId: string): void {
    if (!this.sectionVisibility[sectionId]) {
      return; // Don't scroll to hidden sections
    }
    
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const frozenHeaderHeight = 80; // Height of frozen header
      const elementPosition = element.offsetTop - frozenHeaderHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }
  
  // Scroll to first visible section
  scrollToFirstVisibleSection(): void {
    const firstVisibleSection = this.visibleSections[0];
    if (firstVisibleSection) {
      this.scrollToSection(firstVisibleSection._id);
    } else {
      // If no sections are visible, scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
  
  // Get section background color for navigation items
  getSectionBackgroundColor(section: any): string {
    // Return section background color if available, otherwise default
    if (section?.background) {
      return section.background;
    }
    
    // Default background color for navigation items
    return 'rgba(255, 255, 255, 0.9)';
  }
  
  // Get contrasting text color based on background color
  getSectionTextColor(section: any): string {
    const backgroundColor = section?.background || 'rgba(255, 255, 255, 0.9)';
    
    // Convert color to RGB values for luminance calculation
    const rgb = this.hexToRgb(backgroundColor) || this.parseRgba(backgroundColor);
    
    if (rgb) {
      // Calculate relative luminance
      const luminance = this.calculateLuminance(rgb.r, rgb.g, rgb.b);
      
      // Return dark text for light backgrounds, light text for dark backgrounds
      return luminance > 0.5 ? '#333333' : '#ffffff';
    }
    
    // Default to dark text
    return '#333333';
  }
  
  // Helper function to convert hex to RGB
  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  // Helper function to parse rgba/rgb strings
  private parseRgba(color: string): {r: number, g: number, b: number} | null {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    } : null;
  }
  
  // Calculate relative luminance
  private calculateLuminance(r: number, g: number, b: number): number {
    // Normalize RGB values
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    // Calculate luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Sidebar collapse/expand methods
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.saveSidebarState();
  }

  private saveSidebarState(): void {
    localStorage.setItem('sidebar-collapsed', this.isSidebarCollapsed.toString());
  }

  private loadSidebarState(): void {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      this.isSidebarCollapsed = savedState === 'true';
    }
  }
}