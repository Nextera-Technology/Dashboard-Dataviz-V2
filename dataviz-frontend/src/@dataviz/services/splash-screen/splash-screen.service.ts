import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DatavizSplashScreenService {
    private _element: HTMLElement | null = null;

    /**
     * Constructor
     */
    constructor() {
        this._createSplashScreen();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the splash screen
     */
    show(): void {
        this._element?.classList.remove('hidden');
    }

    /**
     * Hide the splash screen
     */
    hide(): void {
        this._element?.classList.add('hidden');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the splash screen element
     */
    private _createSplashScreen(): void {
        // Create the splash screen element
        this._element = document.createElement('div');
        this._element.id = 'dataviz-splash-screen';
        this._element.classList.add('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'bg-white', 'dark:bg-gray-900');

        // Create the splash screen content
        const content = document.createElement('div');
        content.classList.add('text-center');

        // Create the logo
        const logo = document.createElement('div');
        logo.classList.add('mb-4');
        logo.innerHTML = `
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            </div>
        `;

        // Create the title
        const title = document.createElement('h1');
        title.classList.add('text-2xl', 'font-bold', 'text-gray-900', 'dark:text-white', 'mb-2');
        title.textContent = 'DataViz Dashboard';

        // Create the subtitle
        const subtitle = document.createElement('p');
        subtitle.classList.add('text-gray-600', 'dark:text-gray-400');
        subtitle.textContent = 'Loading...';

        // Create the spinner
        const spinner = document.createElement('div');
        spinner.classList.add('mt-4');
        spinner.innerHTML = `
            <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        `;

        // Append all elements
        content.appendChild(logo);
        content.appendChild(title);
        content.appendChild(subtitle);
        content.appendChild(spinner);
        this._element.appendChild(content);

        // Add the splash screen to the body
        document.body.appendChild(this._element);

        // Hide the splash screen by default
        this.hide();
    }
} 