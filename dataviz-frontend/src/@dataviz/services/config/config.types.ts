export interface DatavizConfig {
    layout?: 'modern' | 'classic' | 'compact';
    scheme?: 'light' | 'dark' | 'auto';
    screens?: {
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
    };
    theme?: string;
    themes?: Array<{
        id: string;
        name: string;
    }>;
    customScrollbars?: boolean;
    layoutConfig?: {
        style?: string;
        width?: 'fullwidth' | 'boxed';
        navbar?: {
            hidden?: boolean;
            folded?: boolean;
            position?: 'left' | 'top' | 'right' | 'bottom';
            variant?: string[];
        };
        toolbar?: {
            hidden?: boolean;
            position?: 'above' | 'above-static' | 'above-fixed' | 'below' | 'below-static' | 'below-fixed';
        };
        footer?: {
            hidden?: boolean;
            position?: 'above' | 'above-static' | 'above-fixed' | 'below' | 'below-static' | 'below-fixed';
        };
        sidePanel?: {
            hidden?: boolean;
            position?: 'left' | 'right';
        };
        contentWidth?: 'full' | 'fullwidth';
        contentLayout?: 'compact' | 'wide';
        scroll?: 'content' | 'page';
        navbarWidth?: number;
        sidePanelWidth?: number;
    };
} 