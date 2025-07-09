import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-charts',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Advanced Charts</h1>
                <p class="text-gray-600 dark:text-gray-400">Interactive data visualization and analytics</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <mat-card class="bg-white dark:bg-gray-800">
                    <mat-card-header>
                        <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Advanced Analytics</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            This section will contain advanced charting features including:
                        </p>
                        <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                            <li>Interactive time series charts</li>
                            <li>Multi-dimensional data visualization</li>
                            <li>Real-time data streaming</li>
                            <li>Custom chart configurations</li>
                            <li>Export and sharing capabilities</li>
                        </ul>
                    </mat-card-content>
                </mat-card>

                <mat-card class="bg-white dark:bg-gray-800">
                    <mat-card-header>
                        <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Chart Gallery</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            Explore different chart types and configurations:
                        </p>
                        <div class="grid grid-cols-2 gap-4">
                            <button mat-button class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-3 rounded-lg">
                                <mat-icon>show_chart</mat-icon>
                                <span class="ml-2">Line Charts</span>
                            </button>
                            <button mat-button class="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-3 rounded-lg">
                                <mat-icon>pie_chart</mat-icon>
                                <span class="ml-2">Pie Charts</span>
                            </button>
                            <button mat-button class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-3 rounded-lg">
                                <mat-icon>bar_chart</mat-icon>
                                <span class="ml-2">Bar Charts</span>
                            </button>
                            <button mat-button class="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 p-3 rounded-lg">
                                <mat-icon>scatter_plot</mat-icon>
                                <span class="ml-2">Scatter Plots</span>
                            </button>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>
        </div>
    `,
    styles: []
})
export class ChartsComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {
        // Initialize charts component
    }
} 