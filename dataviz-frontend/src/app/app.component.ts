import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    template: `
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
            <router-outlet></router-outlet>
        </div>
    `,
    styles: []
})
export class AppComponent implements OnInit {
    /**
     * Constructor
     */
    constructor() {}

    /**
     * On init
     */
    ngOnInit(): void {
        // Initialize the application
        console.log('DataViz Dashboard initialized');
    }
} 