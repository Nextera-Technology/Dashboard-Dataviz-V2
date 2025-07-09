import { provideHttpClient } from '@angular/common/http';
import {
    EnvironmentProviders,
    Provider,
    importProvidersFrom,
    inject,
    provideAppInitializer,
    provideEnvironmentInitializer,
} from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { DatavizConfig } from '@dataviz/services/config';
import { DATAVIZ_CONFIG } from '@dataviz/services/config/config.constants';
import { DatavizConfirmationService } from '@dataviz/services/confirmation';
import { DatavizLoadingService } from '@dataviz/services/loading';
import { DatavizMediaWatcherService } from '@dataviz/services/media-watcher';
import { DatavizPlatformService } from '@dataviz/services/platform';
import { DatavizSplashScreenService } from '@dataviz/services/splash-screen';
import { DatavizUtilsService } from '@dataviz/services/utils';

export type DatavizProviderConfig = {
    dataviz?: DatavizConfig;
};

/**
 * Dataviz provider
 */
export const provideDataviz = (
    config: DatavizProviderConfig
): Array<Provider | EnvironmentProviders> => {
    // Base providers
    const providers: Array<Provider | EnvironmentProviders> = [
        {
            // Disable 'theme' sanity check
            provide: MATERIAL_SANITY_CHECKS,
            useValue: {
                doctype: true,
                theme: false,
                version: true,
            },
        },
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
            },
        },
        {
            provide: DATAVIZ_CONFIG,
            useValue: config?.dataviz ?? {},
        },

        importProvidersFrom(MatDialogModule),
        provideEnvironmentInitializer(() => inject(DatavizConfirmationService)),

        provideHttpClient(),
        provideEnvironmentInitializer(() => inject(DatavizLoadingService)),

        provideEnvironmentInitializer(() => inject(DatavizMediaWatcherService)),
        provideEnvironmentInitializer(() => inject(DatavizPlatformService)),
        provideEnvironmentInitializer(() => inject(DatavizSplashScreenService)),
        provideEnvironmentInitializer(() => inject(DatavizUtilsService)),
    ];

    // Return the providers
    return providers;
}; 