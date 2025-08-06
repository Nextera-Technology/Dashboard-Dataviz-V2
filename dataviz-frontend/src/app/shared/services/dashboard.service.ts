import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardData {
  title: string;
  subtitle: string;
  theme: 'light' | 'dark';
  sections: Section[];
}

export interface Section {
  _id: string;
  id: string;
  title: string;
  name: string | null;
  background: string;
  visible: boolean;
  widgets: Widget[];
  status: string | null;
}


export interface Widget {
  /**
   * MongoDB style identifier. Present on persisted widgets returned by the backend.
   * Not required for newly created (client-side) widgets, so keep it optional.
   */
  _id?: string;
  /** Friendly identifier string used in the mock data/service. */
  id: string;
  title: string;
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'map';
  size: 'small' | 'medium' | 'large';
  dataSource: string;
  visible: boolean;
  section: string;
  lastUpdated?: Date;
  data?: any;
  /**
   * Optional background color or CSS value used for styling the widget itself (not the internal data).
   * Several templates already bind to `widget.background`, so leaving it undefined should gracefully
   * fall back to default styling.
   */
  background?: string;
  actions?: WidgetAction[];
}

// Legacy interface names for backward compatibility
export interface DashboardSection extends Section {}
export interface DashboardWidget extends Widget {}

export interface WidgetAction {
  id: string;
  type: string;
  title: string;
  label: string;
  icon: string;
  action: string;
}

export interface FilterData {
  certifications: CertificationFilter[];
  sections: SectionFilter[];
}

export interface CertificationFilter {
  id: string;
  name: string;
  selected: boolean;
}

export interface SectionFilter {
  id: string;
  name: string;
  selected: boolean;
}

// Admin interfaces
export interface CreateSectionData {
  title: string;
  background: string;
}

export interface UpdateSectionData {
  id: string;
  title: string;
  background: string;
}

export interface CreateWidgetData {
  title: string;
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'map';
  size: 'small' | 'medium' | 'large';
  dataSource: string;
  section: string;
}

export interface UpdateWidgetData {
  id: string;
  title: string;
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'map';
  size: 'small' | 'medium' | 'large';
  dataSource: string;
  section: string;
}

// Dashboard Builder interfaces
export interface DashboardListItem {
  id: string;
  name: string;
  title: string;
  source: string;
  createdDate: Date;
  lastModified: Date;
}

export interface WidgetConfigData {
  title: string;
  rows: number;
  columns: number;
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'map';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Mock data storage
  private dashboardData: DashboardData = {
    title: 'Career Insight Dashboard',
    subtitle: 'Data source: Career Survey 2024',
    theme: 'light',
    sections: [
      {
        _id:"0",
        id: '1',
        name: 'Overview',
        status: null,
        title: 'Overview',
        background: '#f5f5f5',
        visible: true,
        widgets: [
          {
            id: '1',
            title: 'Total Students',
            type: 'metric',
            size: 'small',
            dataSource: 'student-survey',
            visible: true,
            section: 'Overview',
            data: {
              value: 1250,
              subtitle: 'Active students',
              background: '#e8f5e8'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          },
          {
            id: '2',
            title: 'Success Rate',
            type: 'metric',
            size: 'small',
            dataSource: 'certification-data',
            visible: true,
            section: 'Overview',
            data: {
              value: 87,
              subtitle: 'Certification success',
              background: '#fff3e0'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          },
          {
            id: '3',
            title: 'Employment Rate',
            type: 'metric',
            size: 'small',
            dataSource: 'employment-survey',
            visible: true,
            section: 'Overview',
            data: {
              value: 92,
              subtitle: 'Graduates employed',
              background: '#e3f2fd'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          },
          {
            id: '4',
            title: 'Average Salary',
            type: 'metric',
            size: 'small',
            dataSource: 'salary-data',
            visible: true,
            section: 'Overview',
            data: {
              value: 65000,
              subtitle: 'Annual average',
              background: '#f3e5f5'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          }
        ]
      },
      {
        _id:"0",
        id: '2',
        name: 'Demographics',
        status: null,
        title: 'Demographics',
        background: '#e3f2fd',
        visible: true,
        widgets: [
          {
            id: '5',
            title: 'Gender Distribution',
            type: 'pie',
            size: 'medium',
            dataSource: 'demographic-data',
            visible: true,
            section: 'Demographics',
            data: {
              series: [
                { name: 'Male', value: 45, color: '#2196F3' },
                { name: 'Female', value: 55, color: '#FF9800' }
              ],
              background: '#ffffff'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          },
          {
            id: '6',
            title: 'Students by Region',
            type: 'map',
            size: 'large',
            dataSource: 'geographic-data',
            visible: true,
            section: 'Demographics',
            data: {
              regions: [
                { name: 'North America', value: 35, color: '#2196F3' },
                { name: 'Europe', value: 28, color: '#4CAF50' },
                { name: 'Asia', value: 22, color: '#FF9800' },
                { name: 'Other', value: 15, color: '#9C27B0' }
              ],
              background: '#ffffff'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          }
        ]
      },
      {
        _id:"0",
        id: '3',
        name: 'Employment',
        status: null,
        title: 'Employment',
        background: '#f3e5f5',
        visible: true,
        widgets: [
          {
            id: '7',
            title: 'Salary Evolution',
            type: 'line',
            size: 'large',
            dataSource: 'salary-data',
            visible: true,
            section: 'Employment',
            data: {
              categories: ['2019', '2020', '2021', '2022', '2023', '2024'],
              series: [
                {
                  name: 'Average Salary',
                  data: [52000, 54000, 58000, 61000, 63000, 65000],
                  color: '#2196F3'
                }
              ],
              background: '#ffffff'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          },
          {
            id: '8',
            title: 'Job Satisfaction',
            type: 'bar',
            size: 'medium',
            dataSource: 'satisfaction-survey',
            visible: true,
            section: 'Employment',
            data: {
              categories: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
              series: [
                {
                  name: 'Satisfaction Level',
                  data: [35, 45, 15, 5],
                  color: '#4CAF50'
                }
              ],
              background: '#ffffff'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          }
        ]
      },
      {
        _id:"0",
        id: '4',
        name: 'Certifications',
        status: null,
        title: 'Certifications',
        background: '#e8f5e8',
        visible: true,
        widgets: [
          {
            id: '9',
            title: 'Certification Success',
            type: 'column',
            size: 'large',
            dataSource: 'certification-data',
            visible: true,
            section: 'Certifications',
            data: {
              categories: ['Web Dev', 'Data Science', 'Mobile Dev', 'Cloud', 'Security'],
              series: [
                {
                  name: 'Success Rate',
                  data: [92, 88, 85, 90, 87],
                  color: '#4CAF50'
                }
              ],
              background: '#ffffff'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          },
          {
            id: '10',
            title: 'Career Path Flow',
            type: 'sankey',
            size: 'medium',
            dataSource: 'career-path-data',
            visible: true,
            section: 'Certifications',
            data: {
              links: [
                { from: 'Web Development', to: 'Frontend', value: 45 },
                { from: 'Web Development', to: 'Backend', value: 35 },
                { from: 'Web Development', to: 'Full Stack', value: 20 },
                { from: 'Data Science', to: 'Analytics', value: 60 },
                { from: 'Data Science', to: 'ML Engineer', value: 40 },
                { from: 'Mobile Development', to: 'iOS', value: 50 },
                { from: 'Mobile Development', to: 'Android', value: 50 }
              ],
              background: '#ffffff'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          }
        ]
      },
      {
        _id:"0",
        id: '5',
        name: 'Analysis',
        status: null,
        title: 'Analysis',
        background: '#fff3e0',
        visible: true,
        widgets: [
          {
            id: '11',
            title: 'Market Trends',
            type: 'text',
            size: 'large',
            dataSource: 'market-analysis',
            visible: true,
            section: 'Analysis',
            data: {
              content: `
                <h4>Key Insights</h4>
                <p>The data shows a strong correlation between certification completion and employment success. 
                Students who complete multiple certifications have a 95% employment rate within 6 months of graduation.</p>
                
                <h4>Trends</h4>
                <ul>
                  <li>Web Development remains the most popular track</li>
                  <li>Data Science certifications show the highest salary growth</li>
                  <li>Mobile development is gaining momentum</li>
                </ul>
              `,
              analysis: `
                <h4>Recommendations</h4>
                <p>Focus on expanding Data Science and Mobile Development programs to meet growing market demand.</p>
              `,
              background: '#ffffff'
            },
            actions: [
              { id: '1', type: 'primary', title: 'Info', label: 'Info', icon: 'paragraph.png', action: 'info' },
              { id: '2', type: 'secondary', title: 'Export', label: 'Export', icon: 'excel.png', action: 'export' },
              { id: '3', type: 'secondary', title: 'Audience', label: 'Audience', icon: 'audience_4644048.png', action: 'audience' }
            ]
          }
        ]
      }
    ]
  };

  private filterData: FilterData = {
    certifications: [
      { id: '1', name: 'Web Development', selected: true },
      { id: '2', name: 'Data Science', selected: true },
      { id: '3', name: 'Mobile Development', selected: false },
      { id: '4', name: 'Cloud Computing', selected: true },
      { id: '5', name: 'Cybersecurity', selected: false }
    ],
    sections: [
      { id: '1', name: 'Overview', selected: true },
      { id: '2', name: 'Demographics', selected: true },
      { id: '3', name: 'Employment', selected: true }
    ]
  };

  constructor() {}

  // Dashboard List methods
  getDashboardList(): Observable<DashboardListItem[]> {
    const dashboards: DashboardListItem[] = [
      {
        id: '1',
        name: 'Career Dashboard',
        title: 'Career Insight Dashboard',
        source: 'Career Survey 2024',
        createdDate: new Date('2024-01-15'),
        lastModified: new Date('2024-03-20')
      },
      {
        id: '2',
        name: 'Sales Dashboard',
        title: 'Sales Performance Dashboard',
        source: 'Sales Analytics 2024',
        createdDate: new Date('2024-02-01'),
        lastModified: new Date('2024-03-18')
      },
      {
        id: '3',
        name: 'Analytics Dashboard',
        title: 'Business Analytics Dashboard',
        source: 'Business Intelligence 2024',
        createdDate: new Date('2024-01-20'),
        lastModified: new Date('2024-03-15')
      }
    ];
    return of(dashboards).pipe(delay(500));
  }

  getDashboardById(id: string): Observable<DashboardData> {
    // For now, always return the main dashboard
    return this.getDashboard();
  }

  // Dashboard Builder methods
  updateWidgetConfig(widgetId: string, config: WidgetConfigData): Observable<Widget> {
    // Find and update widget in sections
    for (const section of this.dashboardData.sections) {
      const widget = section.widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.title = config.title;
        widget.type = config.type;
        // Convert rows/columns to size
        const totalSize = config.rows * config.columns;
        if (totalSize <= 1) widget.size = 'small';
        else if (totalSize <= 4) widget.size = 'medium';
        else widget.size = 'large';
        
        widget.lastUpdated = new Date();
        return of(widget).pipe(delay(500));
      }
    }
    return of(null as any).pipe(delay(500));
  }

  moveWidget(widgetId: string, fromSectionId: string, toSectionId: string): Observable<boolean> {
    const fromSection = this.dashboardData.sections.find(s => s.id === fromSectionId);
    const toSection = this.dashboardData.sections.find(s => s.id === toSectionId);
    
    if (fromSection && toSection) {
      const widgetIndex = fromSection.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex !== -1) {
        const widget = fromSection.widgets.splice(widgetIndex, 1)[0];
        widget.section = toSection.title;
        toSection.widgets.push(widget);
        return of(true).pipe(delay(500));
      }
    }
    return of(false).pipe(delay(500));
  }

  // Dashboard data methods
  getDashboard(): Observable<DashboardData> {
    return of(this.dashboardData).pipe(delay(500));
  }

  getFilters(): Observable<FilterData> {
    return of(this.filterData).pipe(delay(300));
  }

  // Section CRUD operations
  getAllSections(): Observable<Section[]> {
    return of(this.dashboardData.sections).pipe(delay(500));
  }

  createSection(sectionData: CreateSectionData): Observable<Section> {
    const newSection: Section = {
      id: Date.now().toString(),
      _id: "0",
      title: sectionData.title,
      background: sectionData.background,
      visible: true,
      widgets: [],
      name: sectionData.title,
      status: true ? 'active' : 'inactive',
    };
    
    this.dashboardData.sections.push(newSection);
    return of(newSection).pipe(delay(500));
  }

  updateSection(sectionData: UpdateSectionData): Observable<Section> {
    const section = this.dashboardData.sections.find(s => s.id === sectionData.id);
    if (section) {
      section.title = sectionData.title;
      section.background = sectionData.background;
      return of(section).pipe(delay(500));
    }
    return of(null as any).pipe(delay(500));
  }

  deleteSection(sectionId: string): Observable<boolean> {
    const index = this.dashboardData.sections.findIndex(s => s.id === sectionId);
    if (index !== -1) {
      this.dashboardData.sections.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  toggleSectionVisibility(sectionId: string): Observable<Section> {
    const section = this.dashboardData.sections.find(s => s.id === sectionId);
    if (section) {
      section.visible = !section.visible;
      return of(section).pipe(delay(500));
    }
    return of(null as any).pipe(delay(500));
  }

  // Widget CRUD operations
  getAllWidgets(): Observable<Widget[]> {
    const allWidgets: Widget[] = [];
    this.dashboardData.sections.forEach(section => {
      section.widgets.forEach(widget => {
        allWidgets.push({ ...widget, section: section.title });
      });
    });
    return of(allWidgets).pipe(delay(500));
  }

  createWidget(widgetData: CreateWidgetData): Observable<Widget> {
    const newWidget: Widget = {
      id: Date.now().toString(),
      title: widgetData.title,
      type: widgetData.type,
      size: widgetData.size,
      dataSource: widgetData.dataSource,
      visible: true,
      section: widgetData.section,
      lastUpdated: new Date()
    };
    
    // Add to the appropriate section
    const section = this.dashboardData.sections.find(s => s.title === widgetData.section);
    if (section) {
      section.widgets.push(newWidget);
    }
    
    return of(newWidget).pipe(delay(500));
  }

  updateWidget(widgetData: UpdateWidgetData): Observable<Widget> {
    // Find widget in sections
    for (const section of this.dashboardData.sections) {
      const widget = section.widgets.find(w => w.id === widgetData.id);
      if (widget) {
        widget.title = widgetData.title;
        widget.type = widgetData.type;
        widget.size = widgetData.size;
        widget.dataSource = widgetData.dataSource;
        widget.section = widgetData.section;
        widget.lastUpdated = new Date();
        return of(widget).pipe(delay(500));
      }
    }
    return of(null as any).pipe(delay(500));
  }

  deleteWidget(widgetId: string): Observable<boolean> {
    for (const section of this.dashboardData.sections) {
      const index = section.widgets.findIndex(w => w.id === widgetId);
      if (index !== -1) {
        section.widgets.splice(index, 1);
        return of(true).pipe(delay(500));
      }
    }
    return of(false).pipe(delay(500));
  }

  toggleWidgetVisibility(widgetId: string): Observable<Widget> {
    for (const section of this.dashboardData.sections) {
      const widget = section.widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.visible = !widget.visible;
        return of(widget).pipe(delay(500));
      }
    }
    return of(null as any).pipe(delay(500));
  }

  // Theme management methods
  getCurrentTheme(): Observable<'light' | 'dark'> {
    return of(this.dashboardData.theme).pipe(delay(300));
  }

  updateTheme(theme: 'light' | 'dark'): Observable<'light' | 'dark'> {
    this.dashboardData.theme = theme;
    return of(theme).pipe(delay(500));
  }

  getAvailableThemes(): Observable<Array<{value: 'light' | 'dark', label: string, icon: string}>> {
    const themes = [
      { value: 'light' as const, label: 'Light Theme', icon: 'light_mode' },
      { value: 'dark' as const, label: 'Dark Theme', icon: 'dark_mode' }
    ];
    return of(themes).pipe(delay(300));
  }
} 