export interface Dashboard {
  name: string;
  title: string;
  source: string;
  sections: Section[];
}

export interface Section {
  name: string;
  title: string;
  background: string;
  widgets: Widget[];
}

export interface Widget {
  name: string;
  title: string;
  type: string;
  chartType?: string;
  cardSize: 'small' | 'medium' | 'large';
  visible: boolean;
  scope: string;
  data: any;
}

// Widget types found in static dashboard
export const WIDGET_TYPES = {
  METRIC: 'metric',
  PIE: 'pie',
  BAR: 'bar',
  LINE: 'line',
  COLUMN: 'column',
  SANKEE: 'sankee'
} as const;

// Chart types for chart widgets
export const CHART_TYPES = {
  PIE: 'pie',
  BAR: 'bar',
  LINE: 'line',
  COLUMN: 'column',
  SANKEE: 'sankee'
} as const;

// Card sizes
export const CARD_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

// Mock data for testing
export const MOCK_DASHBOARD: Dashboard = {
  name: 'rdc-2022',
  title: 'RDC 2022 - Enquêtes d\'Employabilité',
  source: 'api/rdc-2022',
  sections: [
    {
      name: 'global',
      title: 'Global',
      background: '#ffffff',
      widgets: [
        {
          name: 'postes',
          title: 'Postes',
          type: WIDGET_TYPES.METRIC,
          cardSize: CARD_SIZES.SMALL,
          visible: true,
          scope: '1',
          data: {
            value: 75,
            subtitle: 'Postes ciblés après 24 mois : 75%',
            trend: 5,
            values: [0, 74, 82, 75],
            labels: ['EE1', 'EE2', 'EE3', 'EE4']
          }
        },
        {
          name: 'domaines',
          title: 'Domaines',
          type: WIDGET_TYPES.METRIC,
          cardSize: CARD_SIZES.SMALL,
          visible: true,
          scope: '2',
          data: {
            value: 97,
            subtitle: 'Domaines ciblés après 24 mois : 97%',
            trend: 2,
            values: [0, 71, 85, 97],
            labels: ['EE1', 'EE2', 'EE3', 'EE4']
          }
        },
        {
          name: 'salaires',
          title: 'Salaires',
          type: WIDGET_TYPES.METRIC,
          cardSize: CARD_SIZES.SMALL,
          visible: true,
          scope: '3',
          data: {
            value: 5,
            subtitle: 'Salaires ciblés après 24 mois : 5%',
            trend: -1,
            values: [0, 5, 4, 5],
            labels: ['EE1', 'EE2', 'EE3', 'EE4']
          }
        },
        {
          name: 'competences',
          title: 'Compétences',
          type: WIDGET_TYPES.METRIC,
          cardSize: CARD_SIZES.SMALL,
          visible: true,
          scope: '4',
          data: {
            value: 60,
            subtitle: '60% des compétences ciblées sont utilisées',
            trend: 3,
            values: [0, 54, 63, 60],
            labels: ['EE1', 'EE2', 'EE3', 'EE4']
          }
        }
      ]
    },
    {
      name: 'emploi',
      title: 'Emploi',
      background: '#f8f9fa',
      widgets: [
        {
          name: 'emplois-cibles',
          title: 'Emplois ciblés après 6 mois',
          type: WIDGET_TYPES.PIE,
          chartType: CHART_TYPES.PIE,
          cardSize: CARD_SIZES.MEDIUM,
          visible: true,
          scope: '1',
          data: {
            series: [
              { name: 'A un emploi', value: 33, color: '#67b7dc' },
              { name: 'Recherche', value: 6, color: '#6794dc' },
              { name: 'Poursuit des études', value: 57, color: '#6771dc' },
              { name: 'Inactif', value: 2, color: '#8067dc' },
              { name: 'Non répondant', value: 2, color: '#a367dc' }
            ]
          }
        },
        {
          name: 'domaines-principaux',
          title: 'Les 3 principaux domaines',
          type: WIDGET_TYPES.PIE,
          chartType: CHART_TYPES.PIE,
          cardSize: CARD_SIZES.MEDIUM,
          visible: true,
          scope: '2',
          data: {
            series: [
              { name: 'IT/Informatique', value: 40, color: '#67b7dc' },
              { name: 'Finance/Banque', value: 30, color: '#6794dc' },
              { name: 'Conseil', value: 30, color: '#6771dc' }
            ]
          }
        }
      ]
    }
  ]
}; 