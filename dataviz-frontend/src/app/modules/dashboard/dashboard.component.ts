import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PdfExportDialogComponent, PdfExportDialogData, PdfExportResult } from 'app/shared/components/pdf-export-dialog/pdf-export-dialog.component';
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { TranslationService } from 'app/shared/services/translation/translation.service';
import { QuickSearchComponent } from 'app/shared/components/quick-search/quick-search.component';
import { MailboxComponent } from 'app/shared/components/mailbox/mailbox.component';
// import { FloatingChatComponent } from 'app/shared/components/floating-chat/floating-chat.component';

import { AuthService, User } from '../../core/auth/auth.service';
import { SessionMonitorService } from '../../core/auth/session-monitor.service';
import { DashboardService, DashboardData, FilterData, CertificationFilter, SectionFilter, Section } from '../../shared/services/dashboard.service';
import { SectionComponent } from '../../shared/components/sections/section.component';
import { DashboardBuilderService } from '../admin/pages/dashboard-builder/dashboard-builder.service';
import { RepositoryFactory } from '@dataviz/repositories/repository.factory';
import { DashboardBuilderRepository } from '@dataviz/repositories/dashboard-builder/dashboard-builder.repository';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';
// @ts-ignore
import { toBlob } from 'html-to-image';
import { Apollo, gql } from 'apollo-angular';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';
import { ShareDataService } from 'app/shared/services/share-data.service';
import { PdfExportStateService } from 'app/shared/services/pdf-export-state.service';
import { MailboxService } from 'app/shared/services/mailbox.service';
import { Subscription } from 'rxjs';

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
    MatDialogModule,
    TranslatePipe,
    SectionComponent,
    QuickSearchComponent,
    MailboxComponent
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
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
  private pendingSchoolFilters: string[] = [];

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

  // Removed expandable sub-menu states - using direct navigation now

  // Subscriptions
  private shareSub: Subscription = new Subscription();

  exportLoading = false;
  private dashboardRepo: DashboardBuilderRepository;
  private autoExportTriggered = false;
  autoExportDataLoading = false;

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
    private shareDataService: ShareDataService,
    public translation: TranslationService,
    private apollo: Apollo,
    private sessionMonitor: SessionMonitorService, // Initialize session monitoring early
    private pdfExportState: PdfExportStateService, //  Track global PDF export state
    private dialog: MatDialog, // For PDF export options dialog
    private cdr: ChangeDetectorRef, // For explicit change detection in production
    private ngZone: NgZone, // For running outside Angular zone
    public mailboxService: MailboxService
  ) {
    shareDataService.setIsDashboard(true);
    this.dashboardRepo = RepositoryFactory.createRepository('dashboard-builder') as DashboardBuilderRepository;
  }

  currentTheme: string = (localStorage.getItem('dv-theme') || 'theme-navy');

  setLanguage(lang: string): void {
    this.translation.setLanguage(lang);
    const msg = this.translation.translate('shared.language_changed') || 'Language changed';
    const closeLabel = this.translation.translate('shared.close') || 'Close';
    this.snackBar.open(msg, closeLabel, { duration: 1500 });
    this.langMenuOpen = false;
  }

  openWelcomeModal(): void {
    const lastId = localStorage.getItem('dashboardId');
    const t = (key: string, fallback: string): string => this.translation.translate(key) || fallback;

    let title = t('admin.welcomeModal.title', 'What do you want to do today?');
    let subtitle = t('admin.welcomeModal.subtitle', "Tell us what you're looking for or choose from quick actions");
    let searchPlaceholder = t('admin.welcomeModal.search_placeholder', 'Search users, dashboards...');
    let searchHint = t('admin.welcomeModal.search_hint', 'Type to search. Results will appear here.');
    let quickActionsLabel = t('admin.welcomeModal.quick_actions_label', 'Quick actions');
    let actionCreateEsTitle = t('admin.welcomeModal.action_create_es_title', 'Create employability survey dashboard');
    let actionCreateJdTitle = t('admin.welcomeModal.action_create_jd_title', 'Create job description dashboard');
    let actionNewDashboardSub = t('admin.welcomeModal.action_new_dashboard_sub', 'New dashboard');
    let actionViewEsTitle = t('admin.welcomeModal.action_view_es_title', 'Enter view dashboard employability survey (last)');
    let actionViewJdTitle = t('admin.welcomeModal.action_view_jd_title', 'Enter view dashboard job description (last)');
    let actionViewLastSub = t('admin.welcomeModal.action_view_last_sub', 'Uses last dashboard');
    let footerHint = t('admin.welcomeModal.footer_hint', 'You can close this and continue; it appears only on first entry.');

    let noResultsText = t('admin.welcomeModal.no_results', 'No results found.');
    let resultSubJob = t('admin.welcomeModal.result_sub_job', 'job description');
    let resultSubEs = t('admin.welcomeModal.result_sub_es', 'employability survey');
    let resultSubUser = t('admin.welcomeModal.result_sub_user', 'user');

    const html = `
      <div class="welcome-modal" style="text-align:left;">
        <div class="wm-header" style="padding:16px 18px;border-bottom:1px solid var(--dv-rail-border);background:linear-gradient(135deg,var(--dv-item-bg),var(--dv-item-hover-bg));border-top-left-radius:16px;border-top-right-radius:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div class="wm-header-left">
            <div id="wm-title" style="font-size:20px;font-weight:800;">${title}</div>
            <div id="wm-subtitle" style="font-size:12px;color:var(--text-secondary);">${subtitle}</div>
          </div>
          <div class="wm-header-right" style="display:flex;align-items:center;gap:8px;position:relative;">
            <div class="wm-lang" style="position:relative;">
              <button id="wm-lang-toggle" style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--dv-rail-border);border-radius:10px;background:var(--dv-item-bg);color:var(--text-primary);">
                <img id="wm-lang-flag" src="${this.translation.getCurrentLanguage() === 'fr' 
                  ? 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/fr.svg' 
                  : 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/gb.svg'}" alt="lang" style="width:20px;height:14px;object-fit:cover;border-radius:2px;" />
                <span id="wm-lang-label" style="font-size:12px;">${this.translation.getCurrentLanguage() === 'fr' ? 'FR' : 'EN'}</span>
                <span style="font-size:10px;color:var(--text-secondary);">▼</span>
              </button>
              <div id="wm-lang-menu" style="display:none;position:absolute;right:0;top:36px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.08);overflow:hidden;min-width:140px;z-index:8500;background:var(--dv-item-bg);border:1px solid var(--dv-rail-border);">
                <button id="wm-lang-en-item" class="wm-lang-item" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:transparent;border:none;width:100%;text-align:left;color:var(--text-primary)">
                  <img src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/gb.svg" alt="EN" style="width:20px;height:14px;object-fit:cover" />
                  <span>English</span>
                </button>
                <button id="wm-lang-fr-item" class="wm-lang-item" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:transparent;border:none;width:100%;text-align:left;color:var(--text-primary)">
                  <img src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/fr.svg" alt="FR" style="width:20px;height:14px;object-fit:cover" />
                  <span>Français</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="wm-body" style="padding:16px 18px;">
          <div id="welcome-search" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--dv-rail-border);border-radius:14px;background:var(--dv-item-bg);box-shadow:0 6px 16px rgba(17,24,39,0.08);">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--dv-item-hover-bg);color:var(--text-secondary);font-size:14px;">🔎</span>
            <input id="wm-search-input" type="text" placeholder="${searchPlaceholder}" style="flex:1;border:none;background:transparent;color:var(--text-primary);outline:none;font-size:13px;" />
          </div>

          <div id="wm-results" style="margin-top:12px;">
            <div id="wm-hint" style="font-size:12px;color:var(--text-secondary);">${searchHint}</div>
          </div>

          <div id="wm-quick-label" style="margin-top:16px;font-size:12px;color:var(--text-secondary);">${quickActionsLabel}</div>
          <div class="wm-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
            <button id="action-create-es" class="wm-action">
              <span class="wm-action-icon">📊</span>
              <div class="wm-action-text">
                <div id="wm-action-create-es-title" class="wm-action-title">${actionCreateEsTitle}</div>
                <div id="wm-action-create-es-sub" class="wm-action-sub">${actionNewDashboardSub}</div>
              </div>
            </button>
            <button id="action-create-jd" class="wm-action">
              <span class="wm-action-icon">🗂️</span>
              <div class="wm-action-text">
                <div id="wm-action-create-jd-title" class="wm-action-title">${actionCreateJdTitle}</div>
                <div id="wm-action-create-jd-sub" class="wm-action-sub">${actionNewDashboardSub}</div>
              </div>
            </button>
            <button id="action-view-es" class="wm-action">
              <span class="wm-action-icon">📄</span>
              <div class="wm-action-text">
                <div id="wm-action-view-es-title" class="wm-action-title">${actionViewEsTitle}</div>
                <div id="wm-action-view-es-sub" class="wm-action-sub">${actionViewLastSub}</div>
              </div>
            </button>
            <button id="action-view-jd" class="wm-action">
              <span class="wm-action-icon">📄</span>
              <div class="wm-action-text">
                <div id="wm-action-view-jd-title" class="wm-action-title">${actionViewJdTitle}</div>
                <div id="wm-action-view-jd-sub" class="wm-action-sub">${actionViewLastSub}</div>
              </div>
            </button>
          </div>
          <div id="wm-footer-hint" style="margin-top:14px;font-size:11px;color:var(--text-secondary);">${footerHint}</div>
        </div>
      </div>
      <style>
        .wm-action { display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--dv-rail-border);border-radius:14px;background:var(--dv-item-bg);cursor:pointer;transition:transform .15s ease, box-shadow .15s ease; }
        .wm-action:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(17,24,39,0.10); }
        .wm-action-icon { font-size:18px; }
        .wm-action-title { font-size:13px;font-weight:600;color:var(--text-primary); }
        .wm-action-sub { font-size:11px;color:var(--text-secondary); }
        .wm-result-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid var(--dv-rail-border); border-radius:12px; background:var(--dv-item-bg); cursor:pointer; }
        .wm-result-item + .wm-result-item { margin-top:8px; }
        .wm-result-icon { width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:6px; background:var(--dv-item-hover-bg); font-size:14px; }
        .wm-result-title { font-size:13px; font-weight:600; color:var(--text-primary); }
        .wm-result-sub { font-size:11px; color:var(--text-secondary); }
        .wm-chip { font-size:10px; padding:2px 6px; border-radius:8px; background:var(--dv-item-hover-bg); color:var(--text-secondary); margin-left:auto; }
        .wm-lang button { transition:background .15s ease, box-shadow .15s ease; }
        .wm-lang button:hover { background: var(--dv-item-hover-bg); box-shadow: 0 6px 12px rgba(17,24,39,0.08); }
        .wm-lang-item:hover { background: var(--dv-item-hover-bg); }
      </style>
    `;

    Swal.fire({
      html,
      width: 720,
      padding: '0',
      showConfirmButton: false,
      showCloseButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      background: 'var(--dv-item-bg)',
      backdrop: this.currentTheme === 'theme-dark' ? 'rgba(2,6,23,0.72)' : 'rgba(17,24,39,0.28)',
      customClass: {
        container: 'dv-welcome-container',
        popup: 'dv-welcome-popup'
      },
      didOpen: () => {
        let langSub: any = null;
        const container = Swal.getHtmlContainer();
        if (!container) return;

        const goDashboard = (id: string | null) => {
          if (id) {
            try { localStorage.setItem('dashboardId', id); } catch {}
            this.shareDataService.setDashboardId(id);
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/admin/dashboard-list']);
          }
          Swal.close();
        };

        const resultsEl = container.querySelector('#wm-results') as HTMLElement | null;
        const searchInput = container.querySelector('#wm-search-input') as HTMLInputElement | null;
        const titleEl = container.querySelector('#wm-title') as HTMLElement | null;
        const subtitleEl = container.querySelector('#wm-subtitle') as HTMLElement | null;
        const hintEl = container.querySelector('#wm-hint') as HTMLElement | null;
        const quickLabelEl = container.querySelector('#wm-quick-label') as HTMLElement | null;
        const acEsTitleEl = container.querySelector('#wm-action-create-es-title') as HTMLElement | null;
        const acEsSubEl = container.querySelector('#wm-action-create-es-sub') as HTMLElement | null;
        const acJdTitleEl = container.querySelector('#wm-action-create-jd-title') as HTMLElement | null;
        const acJdSubEl = container.querySelector('#wm-action-create-jd-sub') as HTMLElement | null;
        const vEsTitleEl = container.querySelector('#wm-action-view-es-title') as HTMLElement | null;
        const vEsSubEl = container.querySelector('#wm-action-view-es-sub') as HTMLElement | null;
        const vJdTitleEl = container.querySelector('#wm-action-view-jd-title') as HTMLElement | null;
        const vJdSubEl = container.querySelector('#wm-action-view-jd-sub') as HTMLElement | null;
        const footerHintEl = container.querySelector('#wm-footer-hint') as HTMLElement | null;

        let debounceTimer: any = null;
        const renderResults = (items: any[]) => {
          if (!resultsEl) return;
          if (!items || items.length === 0) {
            resultsEl.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);">${noResultsText}</div>`;
            return;
          }
          resultsEl.innerHTML = items.map((item: any) => {
            const cat = (item.category || '').toLowerCase();
            const icon = cat.includes('job') ? '🗂️' : (cat.includes('es') ? '📊' : (cat.includes('user') ? '👤' : '🔎'));
            const subtitle = cat.includes('job')
              ? `${resultSubJob}`
              : (cat.includes('es')
                  ? `${resultSubEs}`
                  : (cat.includes('user')
                      ? `${resultSubUser}`
                      : (item.subtitle || '')));
            return `
              <div class="wm-result-item" data-id="${item.id || ''}" data-cat="${item.category || ''}">
                <span class="wm-result-icon">${icon}</span>
                <div>
                  <div class="wm-result-title">${item.title || item.name || 'Untitled'}</div>
                  <div class="wm-result-sub">${subtitle}</div>
                </div>
                <span class="wm-chip">${item.category || ''}</span>
              </div>
            `;
          }).join('');

          resultsEl.querySelectorAll('.wm-result-item').forEach(el => {
            el.addEventListener('click', () => {
              const id = (el as HTMLElement).getAttribute('data-id');
              const cat = ((el as HTMLElement).getAttribute('data-cat') || '').toUpperCase();
              if (cat.includes('USER')) {
                this.router.navigate(['/admin/user-management']);
                Swal.close();
                return;
              }
              if (id) {
                this.shareDataService.setDashboardId(id);
                this.router.navigate(['/dashboard']);
                Swal.close();
              }
            });
          });
        };

        const performSearch = async (query: string) => {
          if (!query || query.length < 2) { renderResults([]); return; }
          try {
            const result = await this.apollo.query<any>({
              query: gql`query QuickSearch($input: QuickSearchInput!) { quickSearch(input: $input) { results { category items { id title name subtitle } } } }`,
              variables: { input: { query, categories: null, limit: 8, page: 1 } },
              fetchPolicy: 'network-only'
            }).toPromise();
            const flat = (result?.data?.quickSearch?.results || []).flatMap((cat: any) =>
              (cat.items || []).map((it: any) => ({ ...it, category: cat.category }))
            );
            renderResults(flat);
          } catch (e) {
            renderResults([]);
          }
        };

        const setVars = () => {
          title = t('admin.welcomeModal.title', 'What do you want to do today?');
          subtitle = t('admin.welcomeModal.subtitle', "Tell us what you're looking for or choose from quick actions");
          searchPlaceholder = t('admin.welcomeModal.search_placeholder', 'Search users, dashboards...');
          searchHint = t('admin.welcomeModal.search_hint', 'Type to search. Results will appear here.');
          quickActionsLabel = t('admin.welcomeModal.quick_actions_label', 'Quick actions');
          actionCreateEsTitle = t('admin.welcomeModal.action_create_es_title', 'Create employability survey dashboard');
          actionCreateJdTitle = t('admin.welcomeModal.action_create_jd_title', 'Create job description dashboard');
          actionNewDashboardSub = t('admin.welcomeModal.action_new_dashboard_sub', 'New dashboard');
          actionViewEsTitle = t('admin.welcomeModal.action_view_es_title', 'Enter view dashboard employability survey (last)');
          actionViewJdTitle = t('admin.welcomeModal.action_view_jd_title', 'Enter view dashboard job description (last)');
          actionViewLastSub = t('admin.welcomeModal.action_view_last_sub', 'Uses last dashboard');
          footerHint = t('admin.welcomeModal.footer_hint', 'You can close this and continue; it appears only on first entry.');
          noResultsText = t('admin.welcomeModal.no_results', 'No results found.');
          resultSubJob = t('admin.welcomeModal.result_sub_job', 'job description');
          resultSubEs = t('admin.welcomeModal.result_sub_es', 'employability survey');
          resultSubUser = t('admin.welcomeModal.result_sub_user', 'user');
        };

        const updateTexts = () => {
          titleEl && (titleEl.textContent = title);
          subtitleEl && (subtitleEl.textContent = subtitle);
          hintEl && (hintEl.textContent = searchHint);
          quickLabelEl && (quickLabelEl.textContent = quickActionsLabel);
          acEsTitleEl && (acEsTitleEl.textContent = actionCreateEsTitle);
          acEsSubEl && (acEsSubEl.textContent = actionNewDashboardSub);
          acJdTitleEl && (acJdTitleEl.textContent = actionCreateJdTitle);
          acJdSubEl && (acJdSubEl.textContent = actionNewDashboardSub);
          vEsTitleEl && (vEsTitleEl.textContent = actionViewEsTitle);
          vEsSubEl && (vEsSubEl.textContent = actionViewLastSub);
          vJdTitleEl && (vJdTitleEl.textContent = actionViewJdTitle);
          vJdSubEl && (vJdSubEl.textContent = actionViewLastSub);
          footerHintEl && (footerHintEl.textContent = footerHint);
          searchInput && (searchInput.placeholder = searchPlaceholder);
        };

        setVars();
        updateTexts();

        const langToggle = container.querySelector('#wm-lang-toggle') as HTMLElement | null;
        const langMenu = container.querySelector('#wm-lang-menu') as HTMLElement | null;
        const langFlag = container.querySelector('#wm-lang-flag') as HTMLImageElement | null;
        const langLabel = container.querySelector('#wm-lang-label') as HTMLElement | null;
        const langEnItem = container.querySelector('#wm-lang-en-item');
        const langFrItem = container.querySelector('#wm-lang-fr-item');

        const updateFlag = () => {
          const cur = this.translation.getCurrentLanguage();
          if (langFlag) langFlag.src = cur === 'fr'
            ? 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/fr.svg'
            : 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/gb.svg';
          if (langLabel) langLabel.textContent = cur === 'fr' ? 'FR' : 'EN';
        };

        langToggle?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (langMenu) langMenu.style.display = langMenu.style.display === 'none' || !langMenu.style.display ? 'block' : 'none';
        });
        document.addEventListener('click', () => { if (langMenu) langMenu.style.display = 'none'; });
        langEnItem?.addEventListener('click', () => { this.setLanguage('en'); if (langMenu) langMenu.style.display = 'none'; });
        langFrItem?.addEventListener('click', () => { this.setLanguage('fr'); if (langMenu) langMenu.style.display = 'none'; });

        langSub = this.translation.translationsLoaded$.subscribe(() => {
          setVars();
          updateTexts();
          updateFlag();
        });

        searchInput?.addEventListener('input', (e: any) => {
          const q = (e.target?.value || '').toString();
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => performSearch(q), 300);
        });

        const openDashboardPicker = async (typeOfUsage: 'EMPLOYABILITY_SURVEY' | 'JOB_DESCRIPTION_EVALUATION') => {
          try {
            const res = await this.apollo.query<any>({
              query: gql`query getAllDashboards($filter: DashboardFilterInput){ getAllDashboards(filter:$filter){ data { _id name title sources { certification classes } typeOfUsage } } }`,
              variables: { filter: { typeOfUsage } },
              fetchPolicy: 'network-only'
            }).toPromise();
            const all = res?.data?.getAllDashboards?.data || [];

            const pickerHtml = `
              <div style="padding:16px; text-align:left;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:var(--dv-item-hover-bg);">📚</span>
                  <div style="font-size:16px;font-weight:800;">Select a dashboard</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 160px 160px;gap:8px;align-items:center;">
                  <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--dv-rail-border);border-radius:10px;background:var(--dv-item-bg);">
                    <span style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--dv-item-hover-bg);">🔎</span>
                    <input id="picker-search" type="text" placeholder="Filter by name, certification, or class" style="flex:1;border:none;background:transparent;color:var(--text-primary);outline:none;font-size:12px;" />
                  </div>
                  <select id="picker-title" style="height:32px;padding:6px 8px;border:1px solid var(--dv-rail-border);border-radius:10px;background:var(--dv-item-bg);color:var(--text-primary);font-size:12px;"></select>
                  <select id="picker-class" style="height:32px;padding:6px 8px;border:1px solid var(--dv-rail-border);border-radius:10px;background:var(--dv-item-bg);color:var(--text-primary);font-size:12px;"></select>
                </div>
                <div id="picker-results" style="margin-top:10px; max-height:420px; overflow:auto;"></div>
              </div>`;

            const renderList = (items: any[]) => {
              const cont = Swal.getHtmlContainer();
              const list = cont?.querySelector('#picker-results') as HTMLElement | null;
              if (!list) return;
              if (!items.length) { list.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);">No results found.</div>`; return; }
              list.innerHTML = items.map((d: any) => {
                const src = (d.sources || []);
                const cert = src[0]?.certification || '';
                const classes = (src[0]?.classes || []).join(', ');
                return `
                  <div class="wm-result-item" data-id="${d._id}" style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--dv-rail-border);border-radius:14px;background:var(--dv-item-bg);">
                    <span class="wm-result-icon" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--dv-item-hover-bg);font-size:16px;">${typeOfUsage === 'JOB_DESCRIPTION_EVALUATION' ? '🗂️' : '📊'}</span>
                    <div style="flex:1;">
                      <div class="wm-result-title" style="font-size:14px;font-weight:700;color:var(--text-primary);">${d.title || d.name || 'Untitled'}</div>
                      <div class="wm-result-sub" style="font-size:12px;color:var(--text-secondary);">${[cert, classes].filter(Boolean).join(' • ')}</div>
                    </div>
                    <button class="open-btn" data-id="${d._id}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid var(--dv-rail-border);border-radius:12px;background:var(--dv-item-bg);cursor:pointer;"><span>👁</span><span>View</span></button>
                  </div>`;
              }).join('');
              list.querySelectorAll('.open-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                  const id = (btn as HTMLElement).getAttribute('data-id');
                  if (id) {
                    this.shareDataService.setDashboardId(id);
                    this.router.navigate(['/dashboard']);
                    Swal.close();
                  }
                });
              });
            };

            Swal.fire({
              html: pickerHtml,
              width: 720,
              padding: '0',
              showConfirmButton: false,
              showCloseButton: true,
              background: 'var(--dv-item-bg)',
              backdrop: this.currentTheme === 'theme-dark' ? 'rgba(2,6,23,0.72)' : 'rgba(17,24,39,0.28)',
              didOpen: () => {
                renderList(all);
                const input = Swal.getHtmlContainer()?.querySelector('#picker-search') as HTMLInputElement | null;
                const titleSel = Swal.getHtmlContainer()?.querySelector('#picker-title') as HTMLSelectElement | null;
                const classSel = Swal.getHtmlContainer()?.querySelector('#picker-class') as HTMLSelectElement | null;
                const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
                const titles = unique(all.flatMap((d: any) => (d.sources || []).map((s: any) => s.certification || '')));
                const classesList = unique(all.flatMap((d: any) => (d.sources || []).flatMap((s: any) => (s.classes || []))));
                if (titleSel) {
                  titleSel.innerHTML = ['All titles', ...titles].map(t => `<option value="${t}">${t}</option>`).join('');
                }
                if (classSel) {
                  classSel.innerHTML = ['All classes', ...classesList].map(c => `<option value="${c}">${c}</option>`).join('');
                }
                let selectedTitle = '';
                let selectedClass = '';
                const applyFilter = () => {
                  const q = (input?.value || '').toLowerCase().trim();
                  const filtered = all.filter((d: any) => {
                    const name = (d.name || '').toLowerCase();
                    const title = (d.title || '').toLowerCase();
                    const srcs = (d.sources || []);
                    const certs = srcs.map((s: any) => (s.certification || '').toLowerCase());
                    const cls = srcs.flatMap((s: any) => (s.classes || []).map((c: any) => (c || '').toLowerCase()));
                    const matchSearch = !q || name.includes(q) || title.includes(q) || certs.some((c: any) => c.includes(q)) || cls.some((c: any) => c.includes(q));
                    const matchTitle = !selectedTitle || selectedTitle === 'All titles' || certs.includes(selectedTitle.toLowerCase());
                    const matchClass = !selectedClass || selectedClass === 'All classes' || cls.includes(selectedClass.toLowerCase());
                    return matchSearch && matchTitle && matchClass;
                  });
                  renderList(filtered);
                };
                let t: any = null;
                input?.addEventListener('input', () => { clearTimeout(t); t = setTimeout(applyFilter, 200); });
                titleSel?.addEventListener('change', () => { selectedTitle = titleSel.value || ''; applyFilter(); });
                classSel?.addEventListener('change', () => { selectedClass = classSel.value || ''; applyFilter(); });
              }
            });
          } catch {}
        };

        container.querySelector('#action-create-es')?.addEventListener('click', () => { this.router.navigate(['/admin/dashboard-create']); Swal.close(); });
        container.querySelector('#action-create-jd')?.addEventListener('click', () => { this.router.navigate(['/admin/job-description-create']); Swal.close(); });
        container.querySelector('#action-view-es')?.addEventListener('click', () => openDashboardPicker('EMPLOYABILITY_SURVEY'));
        container.querySelector('#action-view-jd')?.addEventListener('click', () => openDashboardPicker('JOB_DESCRIPTION_EVALUATION'));
      },
    });
  }

  async exportFullDashboardToPDF(opts?: { exportType: 'all_schools' | 'selected_school' | 'no_school'; selectedSchools: string[]; useServerExport?: boolean }): Promise<void> {
    if (!this.dashboard || !this.dashboardId) return;
    
    if (this.pdfExportState.isExporting) {
      const currentWidget = this.pdfExportState.currentWidgetTitle || this.pdfExportState.currentWidgetId || 'another widget';
      await Swal.fire({
        icon: 'warning',
        title: this.translation.translate('shared.export.pdf.already_processing_title'),
        html: this.translation.translate('shared.export.pdf.already_processing_message')
          .replace('{{widget}}', currentWidget),
        confirmButtonText: 'OK'
      });
      return;
    }

    if (opts?.useServerExport) {
      this.exportLoading = true;
      this.pdfExportState.startExport(this.dashboardId, this.dashboard.title || this.dashboard.name || 'Dashboard');
      try {
        const raw = (this.dashboard as any)?.currentSchools || '';
        const trimmed = typeof raw === 'string' ? raw.trim() : '';
        let specificSchools: string[] = [];
        if (trimmed && trimmed.toUpperCase() !== 'ALL') {
          specificSchools = trimmed.split(',').map(s => s.trim()).filter(Boolean);
        }

        const schoolFilters: string[] = [];

        const result = await this.dashboardRepo.exportDashboardWithSchoolsPdf(
          this.dashboardId!,
          schoolFilters,
          false,
          specificSchools
        );

        const dashboardPdf = result?.dashboardPdf;
        const filename = dashboardPdf?.filename || '';
        let url = dashboardPdf?.url || '';
        if (!url && filename) {
          const base = environment.fileUrl || '';
          url = filename.startsWith('http') ? filename : `${base}${filename}`;
        }

        if (!url) {
          const eTitle = this.translation.translate('shared.export.pdf.error_title') || 'Export Failed';
          const eMsg = this.translation.translate('shared.export.pdf.error_message') || 'Failed to generate PDF. Please try again later.';
          await this.notifier.error(eTitle, eMsg);
          return;
        }

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.download = filename || `dashboard-${this.dashboardId}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        const sTitle = this.translation.translate('shared.export.pdf.success_title') || 'PDF Export Successful';
        const sMsg = this.translation.translate('shared.export.pdf.success_message') || 'Your PDF has been generated and downloaded.';
        await this.notifier.success(sTitle, sMsg);
      } catch (e) {
        const eTitle = this.translation.translate('shared.export.pdf.error_title') || 'Export Failed';
        const eMsg = this.translation.translate('shared.export.pdf.error_message') || 'Failed to generate PDF. Please try again later.';
        await this.notifier.error(eTitle, eMsg);
      } finally {
        this.exportLoading = false;
        this.pdfExportState.endExport();
      }
      return;
    }

    let result: PdfExportResult | null = null;
    if (!opts) {
      // Show PDF export options dialog
      const isES = !this.isJobDescriptionDashboard();
      const dialogRef = this.dialog.open(PdfExportDialogComponent, {
        width: '600px',
        data: {
          dashboardId: this.dashboardId,
          dashboardTitle: this.dashboard.title || this.dashboard.name || 'Dashboard',
          isEmployabilitySurvey: isES
        } as PdfExportDialogData,
        panelClass: 'modern-dialog',
        backdropClass: 'modern-backdrop',
        disableClose: false
      });
      result = await dialogRef.afterClosed().toPromise();
      if (!result) return;
    } else {
      result = { exportType: opts.exportType, selectedSchools: opts.selectedSchools };
    }

    const allWidgets: any[] = (this.dashboard.sectionIds || [])
      .flatMap((section: any) => (section.widgetIds || []))
      .filter((w: any) => w && (w.visible !== false));
    const widgets = allWidgets.map((w: any) => ({ widgetId: w._id || w.id }));
    if (!widgets.length) {
      const t = this.translation.translate('shared.export.pdf.error_title');
      const m = this.translation.translate('shared.export.pdf.error_message');
      await this.notifier.error(t || 'Export Failed', m || 'Failed to generate PDF');
      return;
    }

    // Store export options for use in PDF generation
    const exportOptions = {
      exportType: result.exportType,
      selectedSchools: result.selectedSchools
    };

    this.exportLoading = true;
    
    // === Track global PDF export state ===
    this.pdfExportState.startExport(this.dashboardId, this.dashboard.title || 'Full Dashboard');
    
    try {
      this.showExportHud(widgets.length);

      let processed = 0;
      let succeeded = 0;
      const failed: Array<{index:number; title:string; id:string}> = [];
      const pdfUrls: string[] = [];
      const widgetsInput: Array<{ widgetId: string; lineChartFilename?: string | null; displayChartFilename?: string | null }> = new Array(allWidgets.length);
      const progressUpdate = () => {
        this.updateExportHud(processed, widgets.length, succeeded);
      };

      const tasks = allWidgets.map((w, idx) => (async () => {
        const id = w._id || w.id;
        const title = w.title || w.name || '';
        let displayChartS3Key: string | undefined;
        let lineChartS3Key: string | undefined;
        try {
          const widgetContainer = this.findWidgetContainerById(id) || this.findWidgetBoxElementByTitle(title);
          if (widgetContainer) {
            try {
              const isWorldMap = String(w?.chartType || '') === 'DRILL_DOWN_MAP' || ['STUDENT_REGION_DISTRIBUTION','REGION_SALARY_AVERAGE'].includes(String(w?.widgetSubType || ''));
              const mapCardEl = (widgetContainer.closest('.map-card') as HTMLElement) || widgetContainer;
              const elementToCapture = isWorldMap ? mapCardEl : widgetContainer;
              displayChartS3Key = await this.withTimeout(this.exportDomElementToPNG(elementToCapture), isWorldMap ? 12000 : 8000);
            } catch {}
            if (!displayChartS3Key) {
              const isWorldMap = String(w?.chartType || '') === 'DRILL_DOWN_MAP' || ['STUDENT_REGION_DISTRIBUTION','REGION_SALARY_AVERAGE'].includes(String(w?.widgetSubType || ''));
              if (isWorldMap) {
                try {
                  const target = (widgetContainer.closest('.map-card') as HTMLElement) || widgetContainer;
                  const blob = await this.withTimeout(toBlob(target as any, { quality: 0.95, backgroundColor: '#ffffff', pixelRatio: 1, cacheBust: true } as any), 9000).catch(()=>undefined);
                  if (blob) {
                    const file = new File([blob], `widget-${id}-display.png`, { type: 'image/png' });
                    const upload = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
                    displayChartS3Key = upload?.s3Key;
                  }
                } catch {}
              }
            }
            if (!displayChartS3Key) {
              const fileFromWidget = await this.withTimeout(this.exportChartElementFallback(widgetContainer), 8000).catch(()=>undefined);
              if (fileFromWidget) {
                const uploadWidget = await this.dashboardRepo.uploadPublicAsset(fileFromWidget, 'IMAGE');
                displayChartS3Key = uploadWidget?.s3Key;
              }
            }
          }
          const isCard = !!(w && (w.chartType === 'CARD'));
          if (isCard && !displayChartS3Key) {
            try {
              if (w?.widgetSubType === 'STATUS_WAVE_BREAKDOWN') {
                displayChartS3Key = await this.withTimeout(this.renderStatusByWaveCardCanvas(w), 9000);
              }
            } catch {}
            if (!displayChartS3Key) {
              try {
                displayChartS3Key = await this.withTimeout(this.renderMetricCardCanvas(w), 9000);
              } catch {}
            }
            if (!displayChartS3Key) {
              try {
                displayChartS3Key = await this.withTimeout(this.captureWidgetCardImage(id, title, w), 9000);
              } catch {}
            }
          }
        } catch {}
        try {
          lineChartS3Key = await this.generateInformationChartS3Key(id);
        } catch {}
        if (!displayChartS3Key) {
          const box = this.findWidgetBoxElementByTitle(title);
          if (box) {
            const blob = await this.withTimeout(toBlob(box, { quality: 0.98, backgroundColor: '#ffffff', pixelRatio: 2, skipFonts: true } as any), 8000).catch(()=>undefined);
            if (blob) {
              const fallbackFile = new File([blob], `widget-${id}-display.png`, { type: 'image/png' });
              const upload2 = await this.dashboardRepo.uploadPublicAsset(fallbackFile, 'IMAGE');
              displayChartS3Key = upload2?.s3Key;
            }
          }
        }
        try {
          const res = await this.dashboardRepo.exportWidgetData(
            id,
            'PDF',
            displayChartS3Key || null,
            lineChartS3Key || null
          );
          const filename: string = (res && (res.filename || res?.fileName)) || '';
          if (filename) {
            const base = environment.fileUrl || '';
            const url = filename.startsWith('http') ? filename : `${base}${filename}`;
            try { localStorage.setItem(`DV_WIDGET_PDF_${id}`, url); } catch {}
            succeeded += 1;
            return url;
          } else {
            failed.push({ index: idx + 1, title: title || '', id });
            return undefined;
          }
        } catch {
          failed.push({ index: idx + 1, title: title || '', id });
          return undefined;
        } finally {
          widgetsInput[idx] = { widgetId: id, lineChartFilename: lineChartS3Key || null, displayChartFilename: displayChartS3Key || null };
          processed += 1;
          progressUpdate();
        }
      })());

      const results = await Promise.all(tasks);
      for (const url of results) {
        if (url) pdfUrls.push(url);
      }

      if (pdfUrls.length === 0) {
        this.hideExportHud();
        const eTitle = this.translation.translate('shared.export.pdf.error_title') || 'Export Failed';
        const eMsg = 'All widgets failed to capture images. No PDF generated.';
        await this.notifier.error(eTitle, eMsg);
        return;
      }
      const mergedName = this.buildMergedFileName();
      let mergedFile: string = '';
      try {
        const mergeRes = await this.dashboardRepo.mergeAsset(pdfUrls, mergedName);
        mergedFile = (mergeRes && (mergeRes.filename || mergeRes?.fileName)) || '';
      } catch (mergeErr) {
        try {
          const fullRes = await this.dashboardRepo.exportDashboardData(this.dashboardId!, 'PDF', widgetsInput);
          mergedFile = (fullRes && (fullRes.filename || (fullRes as any)?.fileName)) || '';
        } catch (fullErr) {
          throw fullErr;
        }
      }
      if (!mergedFile) throw new Error('No merged filename returned');

      const base = environment.fileUrl || '';
      let url = mergedFile.startsWith('http') ? mergedFile : `${base}${mergedFile}`;

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `dashboard-${this.dashboardId}.pdf`;
      anchor.target = '_blank';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      this.hideExportHud();
      const sTitle = this.translation.translate('shared.export.pdf.success_title') || 'PDF Export Successful';
      const skipped = failed.length ? ` • Skipped ${failed.length}` : '';
      const sMsg = `Generated PDF for ${pdfUrls.length} widgets${skipped}.`;
      await this.notifier.success(sTitle, sMsg);
      if (failed.length) {
        const list = failed.map(f => `${f.index}. ${f.title || f.id}`).join('\n');
        await Swal.fire({ icon: 'warning', title: 'Some widgets skipped', html: `<pre style="text-align:left">${list}</pre>` });
      }
    } catch (e) {
      this.hideExportHud();
      const eTitle = this.translation.translate('shared.export.pdf.error_title') || 'Export Failed';
      const eMsg = this.translation.translate('shared.export.pdf.error_message') || 'Failed to generate PDF. Please try again later.';
      await this.notifier.error(eTitle, eMsg);
    } finally {
      this.exportLoading = false;
      this.pdfExportState.endExport(); //End global export tracking
    }
  }

  private findWidgetBoxElementByTitle(title: string): HTMLElement | null {
    if (!title) return null;
    const norm = (s: string) => (s || '').replace(/\s+/g, ' ').trim();
    const target = norm(title);

    const titleEls = Array.from(document.querySelectorAll('.chart-title, .metric-title, .text-title')) as HTMLElement[];
    for (const el of titleEls) {
      const txt = norm(el.textContent || '');
      if (txt === target) {
        const chartBox = el.closest('.chart-box');
        if (chartBox instanceof HTMLElement) return chartBox;
        const textBox = el.closest('.text-box');
        if (textBox instanceof HTMLElement) return textBox;
        const widget = el.closest('.widget');
        if (widget instanceof HTMLElement) return widget;
        const parent = el.parentElement as HTMLElement | null;
        if (parent) return parent;
      }
    }
    return null;
  }

  private findChartContainerByWidget(widgetId: string, title: string): HTMLElement | null {
    const ids = [
      `pie-chart-div-${widgetId}`,
      `bar-chart-div-${widgetId}`,
      `line-chart-div-${widgetId}`,
      `column-chart-div-${widgetId}`,
      `sankey-chart-div-${widgetId}`,
      `map-div-${widgetId}`,
      `map-chart-div-${widgetId}`,
      `students-map-chart-div-${widgetId}`,
      `salary-map-chart-div-${widgetId}`,
      `chart-div-${widgetId}`,
      `widget-chart-${widgetId}`
    ];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) return el as HTMLElement;
    }
    const boxes = Array.from(document.querySelectorAll('.chart-box')) as HTMLElement[];
    for (const box of boxes) {
      const t = box.querySelector('.chart-title');
      if (t && (t.textContent || '').trim() === (title || '').trim()) {
        const inner = box.querySelector('.chart-container');
        if (inner instanceof HTMLElement) return inner;
        return box;
      }
    }
    const worldMapContainers = Array.from(document.querySelectorAll('.map-chart-container')) as HTMLElement[];
    if (worldMapContainers.length) return worldMapContainers[0];
    return null;
  }

  private findWidgetContainerById(widgetId: string): HTMLElement | null {
    if (!widgetId) return null;
    const el = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (el instanceof HTMLElement) {
      const innerBox = el.querySelector('.chart-box, .text-box, .widget-container, .map-card');
      if (innerBox instanceof HTMLElement) return innerBox as HTMLElement;
      return el as HTMLElement;
    }
    const boxes = Array.from(document.querySelectorAll('.chart-box')) as HTMLElement[];
    for (const box of boxes) {
      const idAttr = box.getAttribute('data-widget-id');
      if (idAttr === widgetId) return box;
    }
    return null;
  }

  private async captureWidgetCardImage(widgetId: string, title: string, widget?: any): Promise<string | undefined> {
    const source = this.findWidgetContainerById(widgetId) || this.findWidgetBoxElementByTitle(title);
    if (!source) return await this.renderMetricCardImageFromData(widgetId, widget);
    const off = document.createElement('div');
    off.style.position = 'fixed';
    off.style.left = '-10000px';
    off.style.top = '0';
    off.style.background = '#ffffff';
    off.style.boxSizing = 'border-box';
    const w = Math.max(source.offsetWidth || 600, 400);
    const h = Math.max(source.offsetHeight || 300, 250);
    off.style.width = w + 'px';
    off.style.height = h + 'px';
    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.boxSizing = 'border-box';
    off.appendChild(clone);
    document.body.appendChild(off);
    try {
      const blob = await toBlob(off as any, { quality: 0.98, backgroundColor: '#ffffff', pixelRatio: 2, skipFonts: true } as any);
      if (!blob) return await this.renderMetricCardImageFromData(widgetId, widget);
      const file = new File([blob], `widget-${widgetId}-card.png`, { type: 'image/png' });
      const upload = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return upload?.s3Key;
    } catch {
      return await this.renderMetricCardImageFromData(widgetId, widget);
    } finally {
      document.body.removeChild(off);
    }
  }

  private async renderMetricCardImageFromData(widgetId: string, widget?: any): Promise<string | undefined> {
    const w: any = widget || null;
    if (!w) return undefined;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.background = '#ffffff';
    container.style.boxSizing = 'border-box';
    container.style.width = '600px';
    container.style.height = '300px';
    const card = document.createElement('div');
    card.style.position = 'relative';
    card.style.textAlign = 'center';
    card.style.borderRadius = '12px';
    card.style.padding = '20px';
    card.style.minHeight = '150px';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.overflow = 'hidden';
    card.style.height = '100%';
    card.style.backgroundColor = (w.background || '#ffffff');
    const content = document.createElement('div');
    content.style.flex = '1';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.justifyContent = 'center';
    content.style.alignItems = 'center';
    content.style.paddingTop = '20px';
    const titleEl = document.createElement('h3');
    titleEl.textContent = w.title || '';
    titleEl.style.fontFamily = 'Inter, Arial, sans-serif';
    titleEl.style.fontSize = '18px';
    titleEl.style.fontWeight = '600';
    titleEl.style.color = '#00454d';
    titleEl.style.margin = '0 0 15px 0';
    titleEl.style.lineHeight = '1.3';
    const items = document.createElement('div');
    items.style.display = 'flex';
    items.style.flexWrap = 'wrap';
    items.style.gap = '1rem';
    items.style.width = '100%';
    items.style.justifyContent = 'center';
    items.style.alignItems = 'center';
    const dataArr = Array.isArray(w.data) ? w.data : [];
    for (let i = 0; i < dataArr.length; i++) {
      const item: any = dataArr[i] || {};
      const block = document.createElement('div');
      block.style.flex = '1 1 auto';
      block.style.minWidth = '100px';
      block.style.maxWidth = '33%';
      const sub = document.createElement('div');
      const hasName = !!item.name;
      sub.textContent = hasName ? String(item.name) : '';
      sub.style.fontSize = '14px';
      sub.style.color = '#666';
      sub.style.marginTop = '8px';
      sub.style.lineHeight = '1.4';
      sub.style.maxWidth = '90%';
      sub.style.display = hasName ? 'block' : 'none';
      const val = document.createElement('div');
      const len = dataArr.length;
      val.textContent = (item.percentage !== undefined && item.percentage !== null) ? `${item.percentage}%` : '';
      val.style.fontSize = len > 5 ? '10px' : (len >= 4 ? '15px' : (len > 2 ? '24px' : '30px'));
      val.style.fontWeight = 'bold';
      val.style.color = '#1e9180';
      val.style.margin = '10px 0';
      val.style.lineHeight = '1';
      block.appendChild(val);
      block.appendChild(sub);
      items.appendChild(block);
    }
    content.appendChild(titleEl);
    content.appendChild(items);
    card.appendChild(content);
    container.appendChild(card);
    document.body.appendChild(container);
    try {
      const blob = await toBlob(container as any, { quality: 0.98, backgroundColor: '#ffffff', pixelRatio: 2, skipFonts: true } as any);
      if (!blob) return undefined;
      const file = new File([blob], `widget-${widgetId}-card.png`, { type: 'image/png' });
      const upload = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return upload?.s3Key;
    } finally {
      document.body.removeChild(container);
    }
  }

  private async renderMetricCardCanvas(widget: any): Promise<string | undefined> {
    try {
      const w = widget || {};
      const dataArr: any[] = Array.isArray(w.data) ? w.data : [];
      const width = 800;
      const height = 420;
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,width,height);
      const bg = w.background || '#ffffff';
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(20+r, 20);
      ctx.lineTo(width-20-r, 20);
      ctx.quadraticCurveTo(width-20, 20, width-20, 20+r);
      ctx.lineTo(width-20, height-20-r);
      ctx.quadraticCurveTo(width-20, height-20, width-20-r, height-20);
      ctx.lineTo(20+r, height-20);
      ctx.quadraticCurveTo(20, height-20, 20, height-20-r);
      ctx.lineTo(20, 20+r);
      ctx.quadraticCurveTo(20, 20, 20+r, 20);
      ctx.closePath();
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.fillStyle = '#00454d';
      ctx.font = '600 22px Arial';
      const title = String(w.title || '');
      const maxTitleWidth = width - 80;
      let titleText = title;
      if (ctx.measureText(titleText).width > maxTitleWidth) {
        while (titleText.length && ctx.measureText(titleText + '…').width > maxTitleWidth) titleText = titleText.slice(0, -1);
        titleText = titleText + '…';
      }
      ctx.fillText(titleText, 40, 64);
      const areaX = 40;
      const areaY = 90;
      const areaW = width - 80;
      const areaH = height - 130;
      const count = Math.max(1, dataArr.length);
      const cols = Math.min(3, count);
      const rows = Math.ceil(count / cols);
      const cellW = areaW / cols;
      const cellH = areaH / rows;
      let idx = 0;
      for (let rIdx = 0; rIdx < rows; rIdx++) {
        for (let cIdx = 0; cIdx < cols; cIdx++) {
          if (idx >= count) break;
          const item = dataArr[idx] || {};
          const x = areaX + cIdx * cellW;
          const y = areaY + rIdx * cellH;
          const val = (item.percentage !== undefined && item.percentage !== null) ? `${item.percentage}%` : '';
          const name = item.name ? String(item.name) : '';
          const len = count;
          const valSize = len > 5 ? 18 : (len >= 4 ? 22 : (len > 2 ? 26 : 32));
          ctx.fillStyle = '#1e9180';
          ctx.font = `700 ${valSize}px Arial`;
          const valW = ctx.measureText(val).width;
          ctx.fillText(val, x + (cellW - valW)/2, y + cellH/2 - 8);
          if (name) {
            ctx.fillStyle = '#666666';
            ctx.font = '500 14px Arial';
            let nm = name;
            const maxW = cellW - 16;
            if (ctx.measureText(nm).width > maxW) {
              while (nm.length && ctx.measureText(nm + '…').width > maxW) nm = nm.slice(0, -1);
              nm = nm + '…';
            }
            const nmW = ctx.measureText(nm).width;
            ctx.fillText(nm, x + (cellW - nmW)/2, y + cellH/2 + 18);
          }
          idx++;
        }
      }
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b)=>resolve(b),'image/png',0.95));
      if (!blob) return undefined;
      const file = new File([blob], `widget-${w._id || w.id || Date.now()}-card.png`, { type: 'image/png' });
      const upload = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return upload?.s3Key;
    } catch {
      return undefined;
    }
  }

  private async renderStatusByWaveCardCanvas(widget: any): Promise<string | undefined> {
    try {
      const w = widget || {};
      const dataArr: any[] = Array.isArray(w.data) ? w.data : [];
      const waves = Array.from(new Set(dataArr.map(d => d.wave))).sort((a,b)=>a-b);
      const headers = waves.map(wv => `EE${wv}`);
      const catMap: { [key: string]: { label: string; color: string; border: string } } = {
        'En activité professionnelle': { label: "A un emploi", color: '#e8f0fb', border: '#3b82f6' },
        "En recherche d'emploi": { label: 'Recherche', color: '#fff2e3', border: '#f59e0b' },
        "En poursuite d'études (formation initiale ou alternance)": { label: 'Poursuit des études', color: '#e7f8f5', border: '#10b981' },
        'Inactif (ex : congés maternité, maladie longue, sabbatique, césure...)': { label: 'Inactif', color: '#fde7ee', border: '#db2777' },
        'Non répondant': { label: 'Non répondant', color: '#edeafc', border: '#7c3aed' }
      };
      const categories = Object.keys(catMap);
      const rows = categories.map(cat => {
        const vals = waves.map(wv => {
          const hit = dataArr.find(d => d.wave === wv && d.name === cat);
          return hit ? (hit.percentage || 0) : 0;
        });
        return { cat, vals };
      });
      const width = 1020;
      const height = 560;
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,width,height);
      // card background with rounded corners
      const r = 18;
      ctx.beginPath();
      ctx.moveTo(16+r, 16);
      ctx.lineTo(width-16-r, 16);
      ctx.quadraticCurveTo(width-16, 16, width-16, 16+r);
      ctx.lineTo(width-16, height-16-r);
      ctx.quadraticCurveTo(width-16, height-16, width-16-r, height-16);
      ctx.lineTo(16+r, height-16);
      ctx.quadraticCurveTo(16, height-16, 16, height-16-r);
      ctx.lineTo(16, 16+r);
      ctx.quadraticCurveTo(16, 16, 16+r, 16);
      ctx.closePath();
      ctx.fillStyle = w.background || '#ffffff';
      ctx.fill();
      // title
      ctx.fillStyle = '#064e49';
      ctx.font = '700 24px Arial';
      const title = String(w.title || '');
      const maxTitleWidth = width - 120;
      let titleText = title;
      if (ctx.measureText(titleText).width > maxTitleWidth) {
        while (titleText.length && ctx.measureText(titleText + '…').width > maxTitleWidth) titleText = titleText.slice(0, -1);
        titleText = titleText + '…';
      }
      ctx.fillText(titleText, 48, 72);
      // headers
      ctx.fillStyle = '#0ea5a3';
      ctx.font = '600 16px Arial';
      const gridX = 48;
      const gridY = 110;
      const catColW = 200;
      const cols = Math.max(1, headers.length);
      const colW = (width - gridX*2 - catColW) / cols;
      headers.forEach((h, i) => {
        const tx = gridX + catColW + i*colW + colW/2;
        const tw = ctx.measureText(h).width;
        ctx.fillText(h, tx - tw/2, gridY);
      });
      // rows
      const rowH = 72;
      const gapY = 16;
      rows.forEach((row, ri) => {
        const label = catMap[row.cat]?.label || row.cat;
        const color = catMap[row.cat]?.color || '#eef2f7';
        const border = catMap[row.cat]?.border || '#94a3b8';
        const y = gridY + 24 + ri*(rowH + gapY);
        // label
        ctx.fillStyle = '#15616d';
        ctx.font = '600 15px Arial';
        const lw = ctx.measureText(label).width;
        ctx.fillText(label, gridX + Math.max(0, (catColW - lw)/2 - 8), y + rowH/2 + 6);
        // values
        row.vals.forEach((val, ci) => {
          const x = gridX + catColW + ci*colW;
          const wCell = colW - 14;
          const hCell = rowH;
          // pill with left border color
          ctx.beginPath();
          const rx = 12;
          ctx.moveTo(x + rx, y);
          ctx.lineTo(x + wCell - rx, y);
          ctx.quadraticCurveTo(x + wCell, y, x + wCell, y + rx);
          ctx.lineTo(x + wCell, y + hCell - rx);
          ctx.quadraticCurveTo(x + wCell, y + hCell, x + wCell - rx, y + hCell);
          ctx.lineTo(x + rx, y + hCell);
          ctx.quadraticCurveTo(x, y + hCell, x, y + hCell - rx);
          ctx.lineTo(x, y + rx);
          ctx.quadraticCurveTo(x, y, x + rx, y);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          // left border accent
          ctx.fillStyle = border;
          ctx.fillRect(x, y, 6, hCell);
          // value text
          const txt = `${val}%`;
          ctx.fillStyle = '#0f172a';
          ctx.font = '700 18px Arial';
          const tw = ctx.measureText(txt).width;
          ctx.fillText(txt, x + wCell/2 - tw/2, y + hCell/2 + 6);
        });
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b)=>resolve(b),'image/png',0.95));
      if (!blob) return undefined;
      const file = new File([blob], `widget-${w._id || w.id || Date.now()}-status-card.png`, { type: 'image/png' });
      const upload = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return upload?.s3Key;
    } catch {
      return undefined;
    }
  }

  private async exportChartElementFallback(container: HTMLElement): Promise<File | undefined> {
    try {
      const canvas: HTMLCanvasElement | null = container.querySelector('canvas');
      if (canvas) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.92));
        if (blob) {
          return new File([blob], `chart-${Date.now()}.png`, { type: 'image/png' });
        }
      }
      const svg: SVGElement | null = container.querySelector('svg');
      if (svg) {
        const cloned = svg.cloneNode(true) as SVGElement;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(cloned);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        let width = 1200;
        let height = 800;
        const viewBox = cloned.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.split(/\s+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            width = Math.max(600, Math.floor(parts[2]));
            height = Math.max(400, Math.floor(parts[3]));
          }
        }
        const outCanvas = document.createElement('canvas');
        outCanvas.width = width;
        outCanvas.height = height;
        const ctx = outCanvas.getContext('2d');
        if (!ctx) return undefined;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const pngBlob = await new Promise<Blob | undefined>((resolve) => {
          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, width, height);
              outCanvas.toBlob((b) => resolve(b || undefined), 'image/png', 0.92);
            } catch {
              resolve(undefined);
            } finally {
              URL.revokeObjectURL(url);
            }
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(undefined); };
          img.src = url;
        });
        if (pngBlob) {
          return new File([pngBlob], `chart-${Date.now()}.png`, { type: 'image/png' });
        }
      }
      const blob = await toBlob(container as any, { quality: 0.95, backgroundColor: '#ffffff', pixelRatio: 1, skipFonts: true } as any);
      if (blob) return new File([blob], `chart-${Date.now()}.png`, { type: 'image/png' });
      return undefined;
    } catch {
      return undefined;
    }
  }

  private async createPlaceholderImageFile(title: string): Promise<File> {
    const w = 800, h = 450;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#0d6efd'; ctx.font = 'bold 20px Inter, Arial';
    ctx.fillText(title || 'Widget', 24, 40);
    ctx.fillStyle = '#888'; ctx.font = '16px Inter, Arial';
    ctx.fillText('No chart image available', 24, 80);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b)=>resolve(b),'image/png',0.92));
    return new File([blob!], `placeholder-${Date.now()}.png`, { type: 'image/png' });
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise.then((v) => { clearTimeout(timer); resolve(v); }).catch((e) => { clearTimeout(timer); reject(e); });
    });
  }
  private async generateInformationChartS3Key(widgetId: string): Promise<string | undefined> {
    try {
      const query = gql`
        mutation GetWidgetDataSources($widgetId: String!, $limitSource: Float) {
          getWidgetDataSources(widgetId: $widgetId, limitSource: $limitSource) {
            dataSources { name count wave }
          }
        }
      `;
      const resp: any = await this.apollo.mutate({ mutation: query, variables: { widgetId, limitSource: 10 } }).toPromise();
      const dataSources: Array<{ name: string; count: number; wave?: any }>= resp?.data?.getWidgetDataSources?.dataSources || [];
      if (!dataSources.length || !(window as any).am5) return undefined;

      const aggregatedMap: Map<string, any> = new Map();
      for (const src of dataSources) {
        const hasWave = src?.wave !== undefined && src?.wave !== null && src?.wave !== '';
        const waveLabel = hasWave ? src.wave : null;
        const key = `${src?.name ?? 'Unknown'}__${hasWave ? waveLabel : 'NOWAVE'}`;
        if (!aggregatedMap.has(key)) {
          aggregatedMap.set(key, {
            category: hasWave ? `${src?.name ?? 'Unknown'} (Wave ${waveLabel})` : `${src?.name ?? 'Unknown'}`,
            count: src?.count ?? 0
          });
        } else {
          const current = aggregatedMap.get(key);
          current.count += (src?.count ?? 0);
        }
      }
      const chartData = Array.from(aggregatedMap.values());
      if (!chartData.length) return undefined;

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.height = Math.max(400, chartData.length * 40) + 'px';
      document.body.appendChild(container);

      const root = (window as any).am5.Root.new(container);
      let s3Key: string | undefined;
      try {
        const chart = (window as any).am5xy.XYChart.new(root, { panX: false, panY: false, layout: root.verticalLayout });
        root.container.children.push(chart);
        const yRenderer = (window as any).am5xy.AxisRendererY.new(root, { minGridDistance: 20 });
        const yAxis = chart.yAxes.push((window as any).am5xy.CategoryAxis.new(root, { categoryField: 'category', renderer: yRenderer }));
        const xAxis = chart.xAxes.push((window as any).am5xy.ValueAxis.new(root, { min: 0, renderer: (window as any).am5xy.AxisRendererX.new(root, {}) }));
        const series = chart.series.push((window as any).am5xy.ColumnSeries.new(root, { xAxis, yAxis, valueXField: 'count', categoryYField: 'category' }));

        // Style columns for clarity in PDF
        series.columns.template.setAll({
          cornerRadiusTL: 4,
          cornerRadiusBL: 4,
          strokeWidth: 1
        });

        yAxis.data.setAll(chartData);
        series.data.setAll(chartData);

        // Add value labels inside bar end to avoid clipping
        series.bullets.push(() => {
          const label = (window as any).am5.Label.new(root, {
            text: "{valueX}",
            populateText: true,
            centerY: (window as any).am5.percent(50),
            centerX: (window as any).am5.percent(100),
            dx: -8,
            fontSize: 12
          });
          return (window as any).am5.Bullet.new(root, {
            locationX: 1,
            sprite: label
          });
        });

        const s3OrUndefined = await this.exportChartToPNG(root as any);
        s3Key = s3OrUndefined || undefined;
      } finally {
        root.dispose();
        document.body.removeChild(container);
      }

      return s3Key;
    } catch {
      return undefined;
    }
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
    const qpId = this.route.snapshot.queryParamMap.get('id');
    if (qpId) {
      this.dashboardId = qpId;
      this.shareDataService.setDashboardId(qpId);
    } else {
      this.dashboardId = this.shareDataService.getDashboardId();
    }

    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadSidebarState();
    const auto = this.route.snapshot.queryParamMap.get('autoExport');
    if (auto === '1' && this.dashboardId) {
      this.autoExportDataLoading = true;
      const key = `DV_AUTO_EXPORT_OPTS_${this.dashboardId}`;
      try {
        const raw = localStorage.getItem(key) || '';
        if (raw) {
          const opts = JSON.parse(raw);
          if (opts && opts.exportType === 'selected_school' && Array.isArray(opts.selectedSchools)) {
            this.pendingSchoolFilters = opts.selectedSchools;
          }
        }
      } catch {}
    }
    this.loadDashboards();
    this.applyTheme(this.currentTheme);

    // React to dashboardId changes from Quick Search when navigating to the same route
    this.shareSub.add(
      this.shareDataService.dashboardId$.subscribe((id) => {
        if (id && id !== this.dashboardId) {
          this.dashboardId = id;
          this.loadDashboards();
        }
      })
    );
  }

  private duplicationRetryCount = 0;
  private readonly maxDuplicationRetries = 10;

  async loadDashboards(isRetry: boolean = false) {
    try {
      let result: any;
      if (this.pendingSchoolFilters && this.pendingSchoolFilters.length > 0) {
        result = await this.dashboardService.openDashboardWithSchoolFilter(this.dashboardId!, this.pendingSchoolFilters);
      } else {
        result = await this.dashboardService.getOneDashboard(this.dashboardId);
      }

      // If dashboard duplication is still in progress, wait and retry a few times
      if (result?.isDuplicationProcessInProgress) {
        if (!isRetry) {
          await this.notifier.infoKey('notifications.duplication_in_progress', undefined, 8000);
        }

        if (this.duplicationRetryCount < this.maxDuplicationRetries) {
          this.duplicationRetryCount++;
          setTimeout(() => {
            this.loadDashboards(true);
          }, 1500);
        }
        return;
      }

      this.duplicationRetryCount = 0;

      if (result) {
        this.dashboardOriginal = result;
        this.dashboard = { ...this.dashboardOriginal };

        // Reset section-related state before repopulating
        this.sectionsList = [];
        this.selectedSections = [];
        this.sectionVisibility = {};
        this.sidebarSectionVisibility = {};

        if (this.dashboardOriginal && this.dashboardOriginal.sectionIds) {
          this.sectionsList = this.dashboardOriginal.sectionIds || [];
          this.sectionsList.forEach(section => {
            if (section?.name) {
              this.selectedSections.push(section.name);
            }
            // Initialize all sections as visible by default
            if (section?._id) {
              this.sectionVisibility[section._id] = true;
              this.sidebarSectionVisibility[section._id] = true;
            }
          });
          this.updateVisibleSections();
          this.updateSelectionCounts();
        }
        
        // Force change detection to ensure view updates in production (AOT)
        // This is critical for navigation from duplicate dashboard flow
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
        this.autoExportDataLoading = false;

        this.autoExportIfRequested();

        if (!this.dashboard?.sectionIds || (this.dashboard.sectionIds as any[])?.length === 0) {
          try {
            const fallback = await this.dashboardService.getOneDashboard(this.dashboardId!);
            if (fallback) {
              this.dashboardOriginal = fallback;
              this.dashboard = { ...fallback };
              this.sectionsList = []; this.selectedSections = []; this.sectionVisibility = {}; this.sidebarSectionVisibility = {};
              if (this.dashboardOriginal.sectionIds) {
                this.sectionsList = this.dashboardOriginal.sectionIds || [];
                this.sectionsList.forEach(section => {
                  if (section?.name) this.selectedSections.push(section.name);
                  if (section?._id) { this.sectionVisibility[section._id] = true; this.sidebarSectionVisibility[section._id] = true; }
                });
                this.updateVisibleSections();
                this.updateSelectionCounts();
              }
              this.ngZone.run(() => { this.cdr.detectChanges(); });
              this.autoExportDataLoading = false;
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error("Error loading dashboards:", error);
      this.autoExportDataLoading = false;
    }
  }

  ngAfterViewInit(): void {
    // Chart initialization can be added here when needed
    setTimeout(() => this.autoExportIfRequested(), 500);
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

  openManageSections(): void {
    if (!this.dashboardId) {
      return;
    }
    this.router.navigate(['/admin/dashboard-builder', this.dashboardId]);
  }

  // Toggle section visibility from frozen header
  toggleSectionVisibility(sectionId: string, event: any): void {
    const isChecked = event.target.checked;
    
    // Update both visibility states immediately
    this.sectionVisibility[sectionId] = isChecked;
    this.sidebarSectionVisibility[sectionId] = isChecked;
    
    // Update visible sections and selected sections for sidebar
    this.updateVisibleSections();
    this.syncSelectedSectionsFromVisibility();
    
    // No auto scrolling - only toggle visibility and button state
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
  
  // Navigate to section (from navigation button)
  navigateToSection(sectionId: string): void {
    // Only navigate if section is visible
    if (!this.sectionVisibility[sectionId]) {
      return;
    }
    
    this.scrollToSection(sectionId);
  }

  // Scroll to specific section (internal method)
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
    return 'var(--dv-item-bg)';
  }
  
  // Get contrasting text color based on background color
  getSectionTextColor(section: any): string {
    const bg = section?.background || '';

    const rgb = this.hexToRgb(bg) || this.parseRgba(bg);

    if (rgb) {
      const luminance = this.calculateLuminance(rgb.r, rgb.g, rgb.b);
      return luminance > 0.5 ? '#333333' : '#ffffff';
    }

    if (this.currentTheme === 'theme-dark' || this.currentTheme === 'theme-navy') {
      return 'rgba(255,255,255,0.92)';
    }

    return 'var(--text-primary)';
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
    localStorage.setItem('dashboard-sidebar-collapsed', this.isSidebarCollapsed.toString());
  }

  private loadSidebarState(): void {
    const collapsed = localStorage.getItem('dashboard-sidebar-collapsed');
    if (collapsed !== null) {
      this.isSidebarCollapsed = collapsed === 'true';
    }

    // Removed expandable menu state loading - using direct navigation now
  }

  ngOnDestroy(): void {
    this.shareSub?.unsubscribe();
  }

  applyTheme(theme: string): void {
    const themes = ['theme-default','theme-brand','theme-teal','theme-dark','theme-navy'];
    themes.forEach(t => document.body.classList.remove(t));
    document.body.classList.add(theme);
    localStorage.setItem('dv-theme', theme);
    this.currentTheme = theme;
  }

  toggleTheme(): void {
    this.applyTheme(this.currentTheme === 'theme-dark' ? 'theme-navy' : 'theme-dark');
  }
  private buildMergedFileName(): string {
    const name = (this.dashboard as any)?.name || 'dashboard';
    const source = this.getDataSourceDisplay?.() || this.getDataSourceDisplay();
    const clean = (s: string) => (s || '').replace(/[\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
    const base = clean(name);
    const cls = clean(source);
    return cls ? `${base} - ${cls}` : base;
  }
  private getChartRoot(container: HTMLElement): any {
    const anyContainer = container as any;
    if (anyContainer._amRoot) return anyContainer._amRoot as any;
    const roots = (window as any).am5?.registry?.rootElements as any;
    if (roots && roots.length) {
      for (let i = 0; i < roots.length; i++) {
        const root = roots[i] || (roots.getIndex ? roots.getIndex(i) : null);
        if (root && root.dom === container) return root;
        const nearest = container.closest('.chart-box') || container.closest('[data-widget-id]') || container;
        if (root?.dom && nearest && nearest.contains(root.dom)) return root;
      }
      if (roots.length === 1) return roots[0] || (roots.getIndex ? roots.getIndex(0) : null);
    }
    return null;
  }

  private applyDashboardData(result: any): void {
    this.dashboardOriginal = result;
    this.dashboard = { ...result };
    this.sectionsList = [];
    this.selectedSections = [];
    this.sectionVisibility = {};
    this.sidebarSectionVisibility = {};
    if (this.dashboardOriginal && this.dashboardOriginal.sectionIds) {
      this.sectionsList = this.dashboardOriginal.sectionIds || [];
      this.sectionsList.forEach(section => {
        if (section?.name) {
          this.selectedSections.push(section.name);
        }
        if (section?._id) {
          this.sectionVisibility[section._id] = true;
          this.sidebarSectionVisibility[section._id] = true;
        }
      });
      this.updateVisibleSections();
      this.updateSelectionCounts();
    }
    this.ngZone.run(() => this.cdr.detectChanges());
  }

  private async autoExportIfRequested(): Promise<void> {
    try {
      const auto = this.route.snapshot.queryParamMap.get('autoExport');
      if (auto !== '1') return;
      if (!this.dashboardId) return;
      if (this.autoExportTriggered) return;
      if (!this.dashboard) {
        for (let i = 0; i < 20; i++) {
          if (this.dashboard) break;
          await new Promise(res => setTimeout(res, 250));
        }
        if (!this.dashboard) return;
      }
      const allWidgets: any[] = (this.dashboard.sectionIds || [])
        .flatMap((section: any) => (section.widgetIds || []))
        .filter((w: any) => w && (w.visible !== false));
      if (allWidgets.length > 0) {
        this.showExportHud(allWidgets.length);
      }
      const key = `DV_AUTO_EXPORT_OPTS_${this.dashboardId}`;
      let optsStr = '';
      try { optsStr = localStorage.getItem(key) || ''; } catch {}
      if (!optsStr) {
        this.autoExportTriggered = true;
        await this.exportDashboardBatchFromOptions({ exportType: 'no_school', selectedSchools: [] });
        return;
      }
      let opts: any;
      try { opts = JSON.parse(optsStr); } catch { return; }
      if (!opts || !opts.exportType) return;
      this.autoExportTriggered = true;
      try { localStorage.removeItem(key); } catch {}
      if (opts.exportType === 'selected_school' && Array.isArray(opts.selectedSchools) && opts.selectedSchools.length > 0) {
        try {
          const filtered = await this.dashboardService.openDashboardWithSchoolFilter(this.dashboardId!, opts.selectedSchools);
          if (filtered) {
            this.applyDashboardData(filtered);
            await new Promise(res => setTimeout(res, 300));
          }
        } catch {}
      } else if (opts.exportType === 'no_school') {
        try {
          const filtered = await this.dashboardService.openDashboardWithSchoolFilter(this.dashboardId!, ['ALL']);
          if (filtered) {
            this.applyDashboardData(filtered);
            await new Promise(res => setTimeout(res, 250));
          }
        } catch {}
      }
      await this.exportDashboardBatchFromOptions({ exportType: opts.exportType, selectedSchools: opts.selectedSchools || [] });
    } catch {}
  }

  async exportDashboardBatchFromOptions(opts: { exportType: 'all_schools' | 'selected_school' | 'no_school'; selectedSchools: string[] }): Promise<void> {
    if (!this.dashboardId) return;
    const isES = !this.isJobDescriptionDashboard();
    const original = this.dashboardOriginal;
    const schools = opts.exportType === 'all_schools'
      ? await this.dashboardRepo.getSchoolDropdown(this.dashboardId, isES)
      : (opts.exportType === 'selected_school' ? (opts.selectedSchools || []) : []);

    if (opts.exportType === 'selected_school' && schools.length) {
      try {
        const filtered = await this.dashboardService.openDashboardWithSchoolFilter(this.dashboardId!, schools);
        if (filtered) {
          this.applyDashboardData(filtered);
          await new Promise(res => setTimeout(res, 350));
          await this.exportFullDashboardToPDF({ exportType: 'no_school', selectedSchools: [] });
        }
      } catch {}
    } else if (opts.exportType === 'all_schools') {
      for (const school of schools) {
        try {
          const filtered = await this.dashboardService.openDashboardWithSchoolFilter(this.dashboardId!, [school]);
          if (filtered) {
            this.applyDashboardData(filtered);
            await new Promise(res => setTimeout(res, 350));
            await this.exportFullDashboardToPDF({ exportType: 'no_school', selectedSchools: [] });
          }
        } catch {}
      }
    } else if (opts.exportType === 'no_school') {
      try {
        const filtered = await this.dashboardService.openDashboardWithSchoolFilter(this.dashboardId!, ['ALL']);
        if (filtered) {
          this.applyDashboardData(filtered);
          await new Promise(res => setTimeout(res, 350));
          await this.exportFullDashboardToPDF({ exportType: 'no_school', selectedSchools: [] });
        }
      } catch {}
    }
    if (original) {
      this.applyDashboardData(original);
    }
  }

  private async exportChartToPNG(root: any): Promise<string | undefined> {
    try {
      let exporting: any;
      const children = root.container.children as any;
      if (children && children.each) {
        children.each((child: any) => {
          if (child instanceof (am5plugins_exporting as any).Exporting) exporting = child;
        });
      }
      if (!exporting) {
        exporting = (am5plugins_exporting as any).Exporting.new(root, {
          menu: (am5plugins_exporting as any).ExportingMenu.new(root, {})
        });
      }
      const domEl = root?.dom as HTMLElement;
      const prevBg = domEl ? domEl.style.background : '';
      if (domEl) domEl.style.background = '#ffffff';
      const dataUrl = await exporting.export('png', { quality: 0.8, scale: 2 } as any);
      if (!dataUrl || typeof dataUrl !== 'string') return undefined;
      const blob = await this.dataURLtoBlob(dataUrl);
      const file = new File([blob], `chart-${Date.now()}.png`, { type: 'image/png' });
      const upload = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      if (domEl) domEl.style.background = prevBg;
      return upload?.s3Key;
    } catch {
      return undefined;
    }
  }

  private async dataURLtoBlob(dataURL: string): Promise<Blob> {
    const arr = dataURL.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match && match[1] ? match[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
  private async exportDomElementToPNG(element: HTMLElement): Promise<string | undefined> {
    try {
      if (!element || !element.offsetWidth || !element.offsetHeight) return undefined;
      const blob = await toBlob(element as any, {
        quality: 0.95,
        width: Math.max(element.offsetWidth, 400),
        height: Math.max(element.offsetHeight, 300),
        backgroundColor: '#ffffff',
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
        filter: (node: any) => {
          if (node && node.classList) {
            const exclude = ['actions-buttons','export-wrapper','display-mode-toggle','mat-menu','cdk-overlay','material-icons','mat-icon'];
            return !exclude.some(cls => node.classList.contains(cls));
          }
          return true;
        }
      } as any);
      if (!blob) return undefined;
      const file = new File([blob], `metric-widget-${Date.now()}.png`, { type: 'image/png' });
      const upload = await this.dashboardRepo.uploadPublicAsset(file, 'IMAGE');
      return upload?.s3Key;
    } catch {
      return undefined;
    }
  }
  private exportHudEl: HTMLElement | null = null;
  private exportHudDragActive = false;
  private exportHudDragStartX = 0;
  private exportHudDragStartY = 0;
  private exportHudStartLeft = 0;
  private exportHudStartTop = 0;
  private showExportHud(total: number): void {
    const existing = document.getElementById('pdf-export-hud');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'pdf-export-hud';
    el.style.position = 'fixed';
    el.style.top = '12px';
    el.style.right = '12px';
    el.style.zIndex = '9999';
    el.style.background = '#ffffff';
    el.style.color = '#0f172a';
    el.style.border = '1px solid rgba(0,0,0,0.1)';
    el.style.borderRadius = '10px';
    el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    el.style.padding = '10px 12px';
    el.style.cursor = 'move';
    el.style.userSelect = 'none';
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="position:relative;width:22px;height:22px;">
          <div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(0,0,0,0.12);"></div>
          <div style="position:absolute;inset:0;border-radius:50%;border:2px solid #3b82f6;border-top-color:transparent;animation:pdfHudSpin 0.9s linear infinite;"></div>
        </div>
        <div style="font-size:13px;opacity:0.85;">
          <div id="pdf-hud-title">${this.translation.translate('shared.export.pdf.preparing_title') || 'Preparing PDF...'}</div>
          <div id="pdf-hud-progress" style="margin-top:4px;font-weight:600;">0/${total} widgets • 0 ok</div>
        </div>
      </div>
      <style>@keyframes pdfHudSpin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(el);
    this.exportHudEl = el;
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const left = window.innerWidth - rect.width - 12;
      el.style.left = left + 'px';
      el.style.right = 'auto';
    }, 0);
    const down = (evt: MouseEvent) => {
      this.exportHudDragActive = true;
      this.exportHudDragStartX = evt.clientX;
      this.exportHudDragStartY = evt.clientY;
      const rect = el.getBoundingClientRect();
      this.exportHudStartLeft = rect.left;
      this.exportHudStartTop = rect.top;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    };
    const move = (evt: MouseEvent) => {
      if (!this.exportHudDragActive) return;
      const dx = evt.clientX - this.exportHudDragStartX;
      const dy = evt.clientY - this.exportHudDragStartY;
      const nextLeft = this.exportHudStartLeft + dx;
      const nextTop = this.exportHudStartTop + dy;
      el.style.left = Math.max(0, Math.min(nextLeft, window.innerWidth - el.offsetWidth)) + 'px';
      el.style.top = Math.max(0, Math.min(nextTop, window.innerHeight - el.offsetHeight)) + 'px';
    };
    const up = () => {
      this.exportHudDragActive = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    el.addEventListener('mousedown', down);
  }
  private updateExportHud(processed: number, total: number, succeeded: number): void {
    const el = this.exportHudEl;
    if (!el) return;
    const p = el.querySelector('#pdf-hud-progress');
    if (p) p.textContent = `${processed}/${total} widgets • ${succeeded} ok`;
  }
  private hideExportHud(): void {
    if (this.exportHudEl) {
      this.exportHudEl.remove();
      this.exportHudEl = null;
      this.exportHudDragActive = false;
    }
  }
}
