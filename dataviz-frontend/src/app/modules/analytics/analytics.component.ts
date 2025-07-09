import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [
        CommonModule, 
        MatCardModule, 
        MatButtonModule, 
        MatIconModule,
        MatTableModule,
        MatPaginatorModule
    ],
    template: `
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Data Analytics</h1>
                <p class="text-gray-600 dark:text-gray-400">Advanced data analysis and insights</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Key Metrics -->
                <mat-card class="bg-white dark:bg-gray-800">
                    <mat-card-header>
                        <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                                <span class="font-semibold text-green-600">12.5%</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-gray-400">Bounce Rate</span>
                                <span class="font-semibold text-red-600">45.2%</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-gray-400">Avg. Session</span>
                                <span class="font-semibold text-blue-600">2m 34s</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-gray-400">Pages/Session</span>
                                <span class="font-semibold text-purple-600">3.2</span>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <!-- Data Sources -->
                <mat-card class="bg-white dark:bg-gray-800">
                    <mat-card-header>
                        <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Data Sources</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">Google Analytics</span>
                                <span class="ml-auto text-xs text-gray-500">Connected</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">Facebook Ads</span>
                                <span class="ml-auto text-xs text-gray-500">Connected</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">CRM System</span>
                                <span class="ml-auto text-xs text-gray-500">Connected</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-400">Email Marketing</span>
                                <span class="ml-auto text-xs text-gray-500">Pending</span>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <!-- Recent Activity -->
                <mat-card class="bg-white dark:bg-gray-800">
                    <mat-card-header>
                        <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">Data sync completed</p>
                                    <p class="text-xs text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">New report generated</p>
                                    <p class="text-xs text-gray-500">15 minutes ago</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">Alert triggered</p>
                                    <p class="text-xs text-gray-500">1 hour ago</p>
                                </div>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Data Table -->
            <mat-card class="mt-6 bg-white dark:bg-gray-800">
                <mat-card-header>
                    <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Data Table</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <table mat-table [dataSource]="dataSource" class="w-full">
                        <!-- Date Column -->
                        <ng-container matColumnDef="date">
                            <th mat-header-cell *matHeaderCellDef>Date</th>
                            <td mat-cell *matCellDef="let element">{{element.date}}</td>
                        </ng-container>

                        <!-- Metric Column -->
                        <ng-container matColumnDef="metric">
                            <th mat-header-cell *matHeaderCellDef>Metric</th>
                            <td mat-cell *matCellDef="let element">{{element.metric}}</td>
                        </ng-container>

                        <!-- Value Column -->
                        <ng-container matColumnDef="value">
                            <th mat-header-cell *matHeaderCellDef>Value</th>
                            <td mat-cell *matCellDef="let element">{{element.value}}</td>
                        </ng-container>

                        <!-- Change Column -->
                        <ng-container matColumnDef="change">
                            <th mat-header-cell *matHeaderCellDef>Change</th>
                            <td mat-cell *matCellDef="let element">
                                <span [class]="element.change >= 0 ? 'text-green-600' : 'text-red-600'">
                                    {{element.change >= 0 ? '+' : ''}}{{element.change}}%
                                </span>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: []
})
export class AnalyticsComponent implements OnInit {
    displayedColumns: string[] = ['date', 'metric', 'value', 'change'];
    dataSource = [
        { date: '2024-01-15', metric: 'Revenue', value: '$45,231', change: 12.5 },
        { date: '2024-01-14', metric: 'Users', value: '2,350', change: -2.1 },
        { date: '2024-01-13', metric: 'Conversion', value: '3.2%', change: 8.7 },
        { date: '2024-01-12', metric: 'Bounce Rate', value: '45.2%', change: -5.3 },
        { date: '2024-01-11', metric: 'Session Duration', value: '2m 34s', change: 15.2 }
    ];

    constructor() {}

    ngOnInit(): void {
        // Initialize analytics component
    }
} 