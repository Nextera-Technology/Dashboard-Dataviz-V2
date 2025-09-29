import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation/translation.service';
import { Apollo } from 'apollo-angular';
import { ShareDataService } from 'app/shared/services/share-data.service';
import { 
  QUICK_SEARCH_QUERY, 
  QuickSearchInput, 
  CategoryResult, 
  QuickSearchResult,
  QuickSearchResponse 
} from '../../../../@dataviz/graphql/queries/quick-search/quick-search.query';

export interface SearchCategory {
  name: string;
  key: string;
  icon: string;
  color: string;
  count?: number;
}

@Component({
  selector: 'app-quick-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatBadgeModule,
    TranslatePipe
  ],
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isOpen = false;
  searchQuery = '';
  loading = false;
  selectedCategory = 'ALL';
  hasMoreResults = false;
  currentPage = 1;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  categories: SearchCategory[] = [
    { name: 'quicksearch.all_results', key: 'ALL', icon: 'search', color: '#666' },
    { name: 'quicksearch.users', key: 'USER', icon: 'person', color: '#3B82F6' },
    { name: 'quicksearch.dashboards_es', key: 'ES_DASHBOARD', icon: 'dashboard', color: '#10B981' },
    { name: 'quicksearch.dashboards_job', key: 'JOB_DESC_DASHBOARD', icon: 'work', color: '#F59E0B' },
    { name: 'quicksearch.sections', key: 'SECTION', icon: 'view_module', color: '#8B5CF6' },
    { name: 'quicksearch.widgets', key: 'WIDGET', icon: 'widgets', color: '#EF4444' },
    { name: 'quicksearch.students', key: 'STUDENT', icon: 'school', color: '#06B6D4' },
    { name: 'quicksearch.user_types', key: 'USER_TYPE', icon: 'shield', color: '#84CC16' }
  ];
  
  searchResults: CategoryResult[] = [];
  currentCategoryResults: QuickSearchResult[] = [];
  groupedResults: { group: string; items: QuickSearchResult[] }[] = [];
  // Backend category keys may vary (singular/plural or synonyms). Define aliases to match reliably.
  private categoryAliases: Record<string, string[]> = {
    'USER': ['USER', 'USERS', 'PERSON', 'PEOPLE'],
    'ES_DASHBOARD': ['ES_DASHBOARD', 'ES_DASHBOARDS', 'EVALUATION_SURVEY', 'EVALUATION_SURVEYS', 'DASHBOARD_ES', 'DASHBOARDS_ES'],
    'JOB_DESC_DASHBOARD': ['JOB_DESC_DASHBOARD', 'JOB_DESC_DASHBOARDS', 'JOB_DESCRIPTION_DASHBOARD', 'JOB_DESCRIPTION_DASHBOARDS', 'DASHBOARD_JOB', 'DASHBOARDS_JOB'],
    'SECTION': ['SECTION', 'SECTIONS'],
    'WIDGET': ['WIDGET', 'WIDGETS'],
    'STUDENT': ['STUDENT', 'STUDENTS'],
    'USER_TYPE': ['USER_TYPE', 'USER_TYPES', 'USER_ROLE', 'USER_ROLES', 'ROLE', 'ROLES']
  };
  
  constructor(
    private router: Router,
    private apollo: Apollo,
    private translationService: TranslationService,
    private shareDataService: ShareDataService
  ) {}
  
  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });

    // Debug: log translation service status
    console.log('Translation service:', this.translationService.getCurrentLanguage());
  }

  private findCategoryResultFor(key: string): CategoryResult | undefined {
    const aliases = (this.categoryAliases[key] || [key]).map(a => a.toLowerCase());
    const found = this.searchResults.find(cat => aliases.includes((cat.category || '').toLowerCase()));
    
    // Debug: log alias matching
    console.log(`Finding category for "${key}":`, {
      aliases,
      backendCategories: this.searchResults.map(cat => cat.category),
      found: found ? `${found.category} (${found.items.length} items)` : 'NOT FOUND'
    });
    
    return found;
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOpen) {
      this.closeSearch();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Ctrl+K or Cmd+K to open search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleSearch();
    }
  }
  
  toggleSearch() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      }, 100);
    } else {
      this.resetSearch();
    }
  }
  
  closeSearch() {
    this.isOpen = false;
    this.resetSearch();
  }
  
  onBackdropClick(event: MouseEvent) {
    this.closeSearch();
  }
  
  resetSearch() {
    this.searchQuery = '';
    this.selectedCategory = 'ALL';
    this.searchResults = [];
    this.currentCategoryResults = [];
    this.groupedResults = [];
    this.currentPage = 1;
    this.hasMoreResults = false;
    this.loading = false;

    // Reset counts shown on the category tabs
    this.categories.forEach(c => c.count = 0);

    // Important: emit a different value so distinctUntilChanged doesn't suppress
    // the same query when reopening (e.g., "test" -> close -> reopen -> "test").
    // This ensures the next identical query triggers performSearch again.
    try {
      this.searchSubject.next('');
    } catch (e) {
      // no-op
    }
  }
  
  onSearchQueryChange(query: string) {
    this.searchSubject.next(query);
  }
  
  async performSearch(query: string) {
    if (!query || query.length < 2) {
      this.searchResults = [];
      this.currentCategoryResults = [];
      return;
    }
    
    this.loading = true;
    
    try {
      // Fetch all categories from backend to ensure we get data for all tabs
      const categories: string[] | null = null;
      const limit = 10;
      
      const input: QuickSearchInput = {
        query,
        categories,
        limit,
        page: this.currentPage
      };
      
      const result = await this.apollo.query<QuickSearchResponse>({
        query: QUICK_SEARCH_QUERY,
        variables: { input },
        fetchPolicy: 'network-only'
      }).toPromise();
      
      if (result?.data?.quickSearch) {
        this.searchResults = result.data.quickSearch.results;
        
        // Debug: log backend categories
        console.log('Backend returned categories:', this.searchResults.map(cat => cat.category));
        console.log('Selected category:', this.selectedCategory);
        
        this.updateCategoryResults();
        this.updateCategoryCounts();
        
        // Check if there are more results
        if (this.selectedCategory === 'ALL') {
          this.hasMoreResults = result.data.quickSearch.totalResults > (this.currentPage * limit);
        } else {
          const selected = this.findCategoryResultFor(this.selectedCategory);
          this.hasMoreResults = (selected?.items?.length || 0) === limit;
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      this.loading = false;
    }
  }
  
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    
    // Update results from existing data instead of re-running search
    if (this.searchResults.length > 0) {
      this.updateCategoryResults();
    } else if (this.searchQuery && this.searchQuery.length >= 2) {
      // Only re-run search if we don't have data yet
      this.performSearch(this.searchQuery);
    }
  }
  
  updateCategoryResults() {
    // Reset grouping on every update
    this.groupedResults = [];

    if (this.selectedCategory === 'ALL') {
      // Flatten all results and add category info to each item
      this.currentCategoryResults = this.searchResults.flatMap(cat => 
        cat.items.map(item => ({ ...item, category: cat.category }))
      );
      return;
    }

    // Find specific category results
    const categoryResult = this.findCategoryResultFor(this.selectedCategory);
    this.currentCategoryResults = categoryResult ? categoryResult.items : [];

    // Build grouped results for SECTION and WIDGET
    if (this.selectedCategory === 'SECTION') {
      console.log('Building SECTION groups with', this.currentCategoryResults.length, 'items');
      this.groupedResults = this.buildGroups(this.currentCategoryResults, (item) => item.dashboardName || 'Unknown Dashboard');
      console.log('SECTION groupedResults:', this.groupedResults);
    } else if (this.selectedCategory === 'WIDGET') {
      console.log('Building WIDGET groups with', this.currentCategoryResults.length, 'items');
      this.groupedResults = this.buildGroups(this.currentCategoryResults, (item) => item.parentName || 'Unknown Section');
      console.log('WIDGET groupedResults:', this.groupedResults);
    }
  }

  private buildGroups(items: QuickSearchResult[], keySelector: (item: QuickSearchResult) => string): { group: string; items: QuickSearchResult[] }[] {
    const map = new Map<string, QuickSearchResult[]>();
    for (const item of items) {
      const key = keySelector(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    // Sort groups and items by title
    const groups = Array.from(map.entries()).map(([group, groupItems]) => ({
      group,
      items: groupItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }));
    groups.sort((a, b) => a.group.localeCompare(b.group));
    return groups;
  }
  
  updateCategoryCounts() {
    this.categories.forEach(category => {
      if (category.key !== 'ALL') {
        const categoryResult = this.findCategoryResultFor(category.key);
        category.count = categoryResult ? categoryResult.items.length : 0;
      } else {
        category.count = this.searchResults.reduce((sum, cat) => sum + cat.items.length, 0);
      }
    });
  }
  
  loadMore() {
    this.currentPage++;
    this.performSearch(this.searchQuery);
  }
  
  formatDate(date: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }
  
  getSchoolColor(school: string | undefined): string {
    const colors: { [key: string]: string } = {
      'ICART': '#F59E0B',
      'ECOLE BLEUE': '#3B82F6',
      'CREAD': '#10B981',
      'EFAP': '#8B5CF6'
    };
    return colors[school || ''] || '#666';
  }
  
  onResultClick(result: QuickSearchResult) {
    // Handle navigation based on result type.
    const cat = this.selectedCategory === 'ALL' ? (result.category || '') : this.selectedCategory;
    if (cat === 'USER') {
      this.router.navigate(['/admin/user-management']);
    } else if (cat === 'ES_DASHBOARD' || cat === 'JOB_DESC_DASHBOARD') {
      // Navigate to dashboard view
      this.shareDataService.setDashboardId(result.id);
      this.router.navigate(['/dashboard']);
    } else if (cat === 'SECTION') {
      // Not implemented yet (requires parent dashboard id) - skip
      return;
    } else if (cat === 'WIDGET') {
      // Not implemented yet (requires parent dashboard id) - skip
      return;
    } else if (cat === 'STUDENT') {
      // Not implemented (no student route) - skip
      return;
    } else if (cat === 'USER_TYPE') {
      // Not implemented (no roles route) - skip
      return;
    }
    
    this.closeSearch();
  }
  
  quickAction(action: string) {
    console.log('Quick action clicked:', action);
    switch (action) {
      case 'create-dashboard':
        this.router.navigate(['/admin/dashboard-create']);
        break;
      case 'manage-users':
        this.router.navigate(['/admin/user-management']);
        break;
      case 'view-dashboards':
        this.router.navigate(['/admin/dashboard-list']);
        break;
      case 'job-descriptions':
        this.router.navigate(['/admin/job-description']);
        break;
    }
    this.closeSearch();
  }
  
  // Helper method to get translation with fallback
  getTranslation(key: string, fallback: string): string {
    const translation = this.translationService.translate(key);
    return translation && translation !== key ? translation : fallback;
  }

  // Action handlers for explicit buttons
  viewDashboard(result: QuickSearchResult): void {
    if (!result?.id) return;
    this.shareDataService.setDashboardId(result.id);
    this.router.navigate(['/dashboard']);
    this.closeSearch();
  }

  manageDashboard(result: QuickSearchResult): void {
    if (!result?.id) return;
    this.router.navigate(['/admin/dashboard-builder', result.id]);
    this.closeSearch();
  }

  manageUsers(): void {
    this.router.navigate(['/admin/user-management']);
    this.closeSearch();
  }
}
