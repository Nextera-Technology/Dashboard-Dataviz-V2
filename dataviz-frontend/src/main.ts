import { inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideDataviz } from './@dataviz/dataviz.provider';
import { HttpLink } from 'apollo-angular/http';
import { provideApollo } from 'apollo-angular';
import { createApollo } from './@dataviz/graphql/graphql';
import { provideIcons } from '@dataviz/icons/icons.provider';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideAnimations(),
        provideHttpClient(),
        provideApollo(() => createApollo(inject(HttpLink))),
        provideIcons(),
        provideDataviz({
            dataviz: {
                layout: 'modern',
                scheme: 'light',
                screens: {
                    'sm': '600px',
                    'md': '960px',
                    'lg': '1280px',
                    'xl': '1440px'
                },
                theme: 'theme-navy',
                themes: [
                    {
                        id: 'theme-default',
                        name: 'Default'
                    },
                    {
                        id: 'theme-brand',
                        name: 'Brand'
                    },
                    {
                        id: 'theme-teal',
                        name: 'Teal'
                    },
                    {
                        id: 'theme-dark',
                        name: 'Dark'
                    },
                    {
                        id: 'theme-navy',
                        name: 'Navy'
                    }
                ]
            }
        })
    ]
}).catch(err => console.error(err)); 
