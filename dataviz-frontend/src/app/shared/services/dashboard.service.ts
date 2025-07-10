import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, filter } from 'rxjs/operators';

export interface DashboardData {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  source: string;
  sections: DashboardSection[];
}

export interface DashboardSection {
  id: string;
  name: string;
  title: string;
  background: string;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  name: string;
  title: string;
  type: 'metric' | 'pie' | 'bar' | 'line' | 'column' | 'sankey' | 'table' | 'text' | 'status-grid' | 'simple-table';
  chartType?: string;
  cardSize: 'small' | 'medium' | 'large';
  visible: boolean;
  scope: string;
  data: any;
  actions?: WidgetAction[];
}

export interface WidgetAction {
  type: 'info' | 'export' | 'scope' | 'download';
  title: string;
  icon: string;
  url?: string;
  action?: string;
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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dashboardSubject = new BehaviorSubject<DashboardData | null>(null);
  private filtersSubject = new BehaviorSubject<FilterData | null>(null);
  
  public dashboard$ = this.dashboardSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();

  constructor() {
    this.loadDashboardData();
    this.loadFilterData();
  }

  // Get dashboard data
  getDashboard(): Observable<DashboardData> {
    return this.dashboard$.pipe(
      delay(500), // Simulate API delay
      // Filter out null values
      filter((dashboard): dashboard is DashboardData => dashboard !== null)
    );
  }

  // Get filters data
  getFilters(): Observable<FilterData> {
    return this.filters$.pipe(
      delay(300),
      // Filter out null values
      filter((filters): filters is FilterData => filters !== null)
    );
  }

  // Update widget visibility
  updateWidgetVisibility(sectionId: string, widgetId: string, visible: boolean): void {
    const dashboard = this.dashboardSubject.value;
    if (!dashboard) return;

    const section = dashboard.sections.find(s => s.id === sectionId);
    if (section) {
      const widget = section.widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.visible = visible;
        this.dashboardSubject.next({ ...dashboard });
      }
    }
  }

  // Update filter selections
  updateCertificationFilter(certId: string, selected: boolean): void {
    const filters = this.filtersSubject.value;
    if (!filters) return;

    const cert = filters.certifications.find(c => c.id === certId);
    if (cert) {
      cert.selected = selected;
      this.filtersSubject.next({ ...filters });
    }
  }

  updateSectionFilter(sectionId: string, selected: boolean): void {
    const filters = this.filtersSubject.value;
    if (!filters) return;

    const section = filters.sections.find(s => s.id === sectionId);
    if (section) {
      section.selected = selected;
      this.filtersSubject.next({ ...filters });
    }
  }

  private loadDashboardData(): void {
    const dashboardData: DashboardData = {
      id: 'rdc-2022',
      name: 'rdc-2022',
      title: 'RDC 2022 - Enquêtes d\'Employabilité',
      subtitle: 'EE1 : Certification | EE2 : Après 6 mois | EE3 : Après 12 mois | EE4 : Après 24 mois',
      source: 'api/rdc-2022',
      sections: [
        {
          id: 'poursuite-etudes',
          name: 'poursuite-etudes',
          title: 'Poursuite d\'études',
          background: '#ffffff',
          widgets: [
            {
              id: 'poursuite-6-mois',
              name: 'poursuite-6-mois',
              title: 'Poursuite d\'étude à 6 mois après la certification',
              type: 'metric',
              cardSize: 'small',
              visible: true,
              scope: '1',
              data: {
                value: 57,
                subtitle: '57% des diplômés poursuivent leurs études',
                trend: 5,
                background: 'rgb(226, 246, 250)'
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'domaine-poursuite',
              name: 'domaine-poursuite',
              title: 'Domaine de Poursuite d\'études',
              type: 'simple-table',
              cardSize: 'small',
              visible: true,
              scope: '2',
              data: {
                headers: ['Immobilier', 'Commerce', 'Banque / Assurance'],
                values: [27, 5, 4],
                background: 'rgb(226, 250, 233)'
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'niveau-top-bac5',
              name: 'niveau-top-bac5',
              title: 'Niveau TOP cible BAC+5',
              type: 'metric',
              cardSize: 'small',
              visible: true,
              scope: '3',
              data: {
                value: 80,
                subtitle: '80% des diplômés visent un niveau BAC+5',
                trend: 3,
                background: 'rgb(250, 239, 226)'
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'poursuivre-etudes-chart',
              name: 'poursuivre-etudes-chart',
              title: 'Poursuivre les études',
              type: 'pie',
              chartType: 'pie',
              cardSize: 'medium',
              visible: true,
              scope: '4',
              data: {
                series: [
                  { name: 'Poursuit des études', value: 182, percentage: 57, color: '#67b7dc' },
                  { name: 'Ne poursuit pas d\'études', value: 136, percentage: 43, color: '#6794dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'meme-ecole-chart',
              name: 'meme-ecole-chart',
              title: 'Poursuivre les études dans la même école',
              type: 'pie',
              chartType: 'pie',
              cardSize: 'medium',
              visible: true,
              scope: '5',
              data: {
                series: [
                  { name: 'Meme ecole', value: 86, percentage: 47, color: '#67b7dc' },
                  { name: 'Ecole differente', value: 97, percentage: 53, color: '#6794dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'statut-professionnel',
              name: 'statut-professionnel',
              title: 'Statut Professionnel : Situation après la certification',
              type: 'status-grid',
              cardSize: 'large',
              visible: true,
              scope: '6',
              data: {
                headers: ['EE1', 'EE2', 'EE3', 'EE4'],
                rows: [
                  { label: 'A un emploi', values: [0, 75, 70, 73], color: '#E6F0F9', borderColor: '#457B9D' },
                  { label: 'Recherche', values: [44, 14, 9, 3], color: '#FAF2E6', borderColor: '#D69B5A' },
                  { label: 'Poursuit des études', values: [56, 3, 4, 3], color: '#E6F7F4', borderColor: '#2A9D8F' },
                  { label: 'Inactif', values: [0, 4, 2, 2], color: '#F9E9EC', borderColor: '#A77A82' },
                  { label: 'Non répondant', values: [0, 4, 15, 19], color: '#e9e9f9', borderColor: '#7d7aa7' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'situation-professionnelle',
              name: 'situation-professionnelle',
              title: 'Situation Professionnelle à 6 mois après la certification',
              type: 'pie',
              chartType: 'pie',
              cardSize: 'medium',
              visible: true,
              scope: '7',
              data: {
                series: [
                  { name: 'A un emploi', value: 33, percentage: 33, color: '#67b7dc' },
                  { name: 'Recherche', value: 6, percentage: 6, color: '#6794dc' },
                  { name: 'Poursuit des études', value: 57, percentage: 57, color: '#6771dc' },
                  { name: 'Inactif', value: 2, percentage: 2, color: '#8067dc' },
                  { name: 'Non répondant', value: 2, percentage: 2, color: '#a367dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            }
          ]
        },
        {
          id: 'global',
          name: 'global',
          title: 'Global',
          background: '#f8f9fa',
          widgets: [
            {
              id: 'postes-cibles',
              name: 'postes-cibles',
              title: 'Postes',
              type: 'simple-table',
              cardSize: 'medium',
              visible: true,
              scope: '1',
              data: {
                subtitle: 'Postes ciblés après 24 mois : 75%',
                headers: ['EE1', 'EE2', 'EE3', 'EE4'],
                values: [0, 74, 82, 75]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'domaines-cibles',
              name: 'domaines-cibles',
              title: 'Domaines',
              type: 'simple-table',
              cardSize: 'medium',
              visible: true,
              scope: '2',
              data: {
                subtitle: 'Domaines ciblés après 24 mois : 97%',
                headers: ['EE1', 'EE2', 'EE3', 'EE4'],
                values: [0, 71, 85, 97]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'salaires-cibles',
              name: 'salaires-cibles',
              title: 'Salaires',
              type: 'simple-table',
              cardSize: 'medium',
              visible: true,
              scope: '3',
              data: {
                subtitle: 'Salaires ciblés après 24 mois : 5%',
                headers: ['EE1', 'EE2', 'EE3', 'EE4'],
                values: [0, 5, 4, 5]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'satisfaction-formation',
              name: 'satisfaction-formation',
              title: 'Taux de satisfaction de la formation',
              type: 'metric',
              cardSize: 'medium',
              visible: true,
              scope: '4',
              data: {
                value: 73,
                subtitle: '73% de satisfaction',
                trend: 2,
                background: 'rgb(226, 246, 250)'
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'analyse-globale',
              name: 'analyse-globale',
              title: 'Analyse Globale des Résultats',
              type: 'text',
              cardSize: 'large',
              visible: true,
              scope: '5',
              data: {
                content: `
                  <p><strong>Résumé des performances :</strong></p>
                  <p>Les résultats montrent une progression positive dans l'employabilité des diplômés. Le taux de postes ciblés atteint 75% après 24 mois, avec une forte progression entre EE2 et EE4.</p>
                  
                  <p><strong>Points clés :</strong></p>
                  <ul>
                    <li>Domaine ciblé : 97% de réussite après 24 mois</li>
                    <li>Satisfaction formation : 73% (en progression)</li>
                    <li>Salaires ciblés : 5% (zone d'amélioration)</li>
                  </ul>
                `,
                analysis: `
                  <p><strong>Analyse détaillée :</strong></p>
                  <p>La formation montre d'excellents résultats en termes de placement dans les domaines ciblés (97%). Cependant, le taux de salaires ciblés reste faible à 5%, indiquant un besoin d'amélioration dans la négociation salariale.</p>
                  
                  <p><strong>Recommandations :</strong></p>
                  <ol>
                    <li>Renforcer les modules de négociation salariale</li>
                    <li>Développer des partenariats avec des entreprises offrant des salaires compétitifs</li>
                    <li>Améliorer le suivi post-formation pour optimiser les placements</li>
                  </ol>
                `,
                background: 'rgb(248, 249, 250)'
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            }
          ]
        },
        {
          id: 'competences',
          name: 'competences',
          title: 'Compétences',
          background: '#ffffff',
          widgets: [
            {
              id: 'competences-cibles',
              name: 'competences-cibles',
              title: 'Les 5 principales compétences utilisées dans les emplois ciblés',
              type: 'bar',
              chartType: 'bar',
              cardSize: 'medium',
              visible: true,
              scope: '1',
              data: {
                series: [
                  { name: 'Participation in the definition of commercial objectives', value: 10, color: '#67b7dc' },
                  { name: 'Implementation of sales support tools', value: 9, color: '#6794dc' },
                  { name: 'Analysis of performance indicators', value: 9, color: '#6771dc' },
                  { name: 'Identification of business development opportunities', value: 8, color: '#8067dc' },
                  { name: 'Participation in the development of individual and collective objectives', value: 8, color: '#a367dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'competences-non-cibles',
              name: 'competences-non-cibles',
              title: 'Les 5 principales compétences utilisées dans les emplois non ciblés',
              type: 'bar',
              chartType: 'bar',
              cardSize: 'medium',
              visible: true,
              scope: '2',
              data: {
                series: [
                  { name: 'Customer relationship management', value: 12, color: '#67b7dc' },
                  { name: 'Market analysis', value: 11, color: '#6794dc' },
                  { name: 'Sales techniques', value: 10, color: '#6771dc' },
                  { name: 'Product knowledge', value: 9, color: '#8067dc' },
                  { name: 'Negotiation skills', value: 8, color: '#a367dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            }
          ]
        },
        {
          id: 'emploi',
          name: 'emploi',
          title: 'Emploi',
          background: '#f8f9fa',
          widgets: [
            {
              id: 'effectif-succes',
              name: 'effectif-succes',
              title: 'Effectif & Taux de succès à certification',
              type: 'pie',
              chartType: 'pie',
              cardSize: 'medium',
              visible: true,
              scope: '1',
              data: {
                totalStudents: 383,
                series: [
                  { name: 'Réussite', value: 320, percentage: 84, color: '#67b7dc' },
                  { name: 'Échec', value: 63, percentage: 16, color: '#6794dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'distribution-enquetes',
              name: 'distribution-enquetes',
              title: 'Distribution des enquêtes par vague',
              type: 'bar',
              chartType: 'bar',
              cardSize: 'medium',
              visible: true,
              scope: '2',
              data: {
                series: [
                  { name: 'EE1', value: 318, color: '#67b7dc' },
                  { name: 'EE2', value: 182, color: '#6794dc' },
                  { name: 'EE3', value: 136, color: '#6771dc' },
                  { name: 'EE4', value: 131, color: '#8067dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'ouverture-completion',
              name: 'ouverture-completion',
              title: 'Ouvert – Commencé – Enquête complétée (EE1–EE4)',
              type: 'column',
              chartType: 'column',
              cardSize: 'large',
              visible: true,
              scope: '3',
              data: {
                categories: ['EE1', 'EE2', 'EE3', 'EE4'],
                series: [
                  { name: 'Envoyés', data: [318, 182, 136, 131], color: '#67b7dc' },
                  { name: 'Ouverts', data: [280, 165, 120, 108], color: '#6794dc' },
                  { name: 'Complétés', data: [272, 160, 118, 105], color: '#6771dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            }
          ]
        },
        {
          id: 'parcours',
          name: 'parcours',
          title: 'Parcours',
          background: '#ffffff',
          widgets: [
            {
              id: 'evolution-inscriptions',
              name: 'evolution-inscriptions',
              title: 'Évolution des inscriptions par mois',
              type: 'line',
              chartType: 'line',
              cardSize: 'large',
              visible: true,
              scope: '1',
              data: {
                categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                series: [
                  { name: 'Inscriptions', data: [45, 52, 38, 61, 55, 48, 67, 73, 58, 64, 71, 83], color: '#67b7dc' },
                  { name: 'Certifications', data: [38, 45, 32, 55, 48, 42, 58, 65, 52, 58, 64, 75], color: '#6794dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'parcours-etudiant',
              name: 'parcours-etudiant',
              title: 'Parcours étudiant : De l\'inscription à l\'emploi',
              type: 'sankey',
              chartType: 'sankey',
              cardSize: 'large',
              visible: true,
              scope: '2',
              data: {
                links: [
                  { from: 'Inscription', to: 'Formation', value: 383 },
                  { from: 'Formation', to: 'Certification', value: 320 },
                  { from: 'Formation', to: 'Poursuite études', value: 63 },
                  { from: 'Certification', to: 'Poursuite études', value: 182 },
                  { from: 'Certification', to: 'Recherche emploi', value: 136 },
                  { from: 'Recherche emploi', to: 'Emploi cible', value: 98 },
                  { from: 'Recherche emploi', to: 'Emploi non-cible', value: 38 }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            }
          ]
        },
        {
          id: 'demographique',
          name: 'demographique',
          title: 'Demographique',
          background: '#f8f9fa',
          widgets: [
            {
              id: 'repartition-age',
              name: 'repartition-age',
              title: 'Répartition par âge',
              type: 'pie',
              chartType: 'pie',
              cardSize: 'medium',
              visible: true,
              scope: '1',
              data: {
                series: [
                  { name: '18-25 ans', value: 45, percentage: 45, color: '#67b7dc' },
                  { name: '26-30 ans', value: 35, percentage: 35, color: '#6794dc' },
                  { name: '31-35 ans', value: 15, percentage: 15, color: '#6771dc' },
                  { name: '35+ ans', value: 5, percentage: 5, color: '#8067dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            },
            {
              id: 'repartition-genre',
              name: 'repartition-genre',
              title: 'Répartition par genre',
              type: 'pie',
              chartType: 'pie',
              cardSize: 'medium',
              visible: true,
              scope: '2',
              data: {
                series: [
                  { name: 'Hommes', value: 55, percentage: 55, color: '#67b7dc' },
                  { name: 'Femmes', value: 45, percentage: 45, color: '#6794dc' }
                ]
              },
              actions: [
                { type: 'info', title: 'Information', icon: 'paragraph.png' },
                { type: 'export', title: 'Export', icon: 'excel.png', url: 'https://docs.google.com/spreadsheets/d/16Ob9SgV4pd171NAXZaZh6hrTec-CWxsf8ifmaRqMewE/edit?gid=892605651#gid=892605651' },
                { type: 'scope', title: 'Scope', icon: 'audience_4644048.png' }
              ]
            }
          ]
        }
      ]
    };

    this.dashboardSubject.next(dashboardData);
  }

  private loadFilterData(): void {
    const filterData: FilterData = {
      certifications: [
        { id: 'cert-1', name: 'Certification A', selected: false },
        { id: 'cert-2', name: 'Certification B', selected: false },
        { id: 'cert-3', name: 'Certification C', selected: false },
        { id: 'cert-4', name: 'Certification D', selected: false },
        { id: 'cert-5', name: 'Certification E', selected: false },
        { id: 'cert-6', name: 'Certification F', selected: false },
        { id: 'cert-7', name: 'Certification G', selected: false },
        { id: 'cert-8', name: 'Certification H', selected: false }
      ],
      sections: [
        { id: 'section-1', name: 'Poursuite d\'études', selected: false },
        { id: 'section-2', name: 'Satisfaction Formation', selected: false },
        { id: 'section-3', name: 'Compétences', selected: false },
        { id: 'section-4', name: 'Emploi', selected: false },
        { id: 'section-5', name: 'Salaires', selected: false },
        { id: 'section-6', name: 'Domaines', selected: false }
      ]
    };

    this.filtersSubject.next(filterData);
  }

  // Simulate API calls for future backend integration
  loadDashboardFromAPI(source: string): Observable<DashboardData> {
    // This would be replaced with actual HTTP calls
    return this.dashboard$.pipe(
      delay(1000),
      filter((dashboard): dashboard is DashboardData => dashboard !== null)
    );
  }

  saveDashboardConfig(dashboard: DashboardData): Observable<boolean> {
    // This would be replaced with actual HTTP calls
    return of(true).pipe(delay(500));
  }
} 