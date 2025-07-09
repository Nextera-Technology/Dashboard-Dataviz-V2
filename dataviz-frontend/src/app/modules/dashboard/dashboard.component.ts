import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

declare var am5: any;
declare var am5xy: any;
declare var am5percent: any;
declare var am5map: any;
declare var am5geodata_worldLow: any;

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatSlideToggleModule
    ],
    template: `
        <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
            <!-- Sidebar -->
            <div class="w-60 bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
                <div class="p-6">
                    <!-- Logo -->
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-3">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h1 class="text-xl font-bold">DataViz Dashboard</h1>
                    </div>

                    <!-- Filters -->
                    <div class="space-y-6">
                        <!-- Search -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Search</label>
                            <input 
                                type="text" 
                                [(ngModel)]="searchTerm"
                                (input)="onSearchChange()"
                                placeholder="Search data..."
                                class="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            >
                        </div>

                        <!-- Date Range -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Date Range</label>
                            <select 
                                [(ngModel)]="selectedDateRange"
                                (change)="onDateRangeChange()"
                                class="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                            </select>
                        </div>

                        <!-- Categories -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Categories</label>
                            <div class="space-y-2 max-h-40 overflow-y-auto">
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.categories.sales" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">Sales</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.categories.marketing" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">Marketing</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.categories.finance" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">Finance</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.categories.operations" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">Operations</span>
                                </label>
                            </div>
                        </div>

                        <!-- Regions -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Regions</label>
                            <div class="space-y-2 max-h-40 overflow-y-auto">
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.regions.north" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">North America</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.regions.south" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">South America</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.regions.europe" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">Europe</span>
                                </label>
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="filters.regions.asia" (change)="onFilterChange()" class="rounded">
                                    <span class="text-sm">Asia Pacific</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 overflow-auto">
                <div class="p-6">
                    <!-- Header -->
                    <div class="mb-6">
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
                        <p class="text-gray-600 dark:text-gray-400">Real-time data visualization and analytics</p>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-content>
                                <div class="flex items-center">
                                    <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white">$45,231</p>
                                        <p class="text-sm text-green-600">+20.1% from last month</p>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>

                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-content>
                                <div class="flex items-center">
                                    <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white">2,350</p>
                                        <p class="text-sm text-green-600">+180.1% from last month</p>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>

                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-content>
                                <div class="flex items-center">
                                    <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                        <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Sales</p>
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white">12,234</p>
                                        <p class="text-sm text-green-600">+19% from last month</p>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>

                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-content>
                                <div class="flex items-center">
                                    <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Growth</p>
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white">+573</p>
                                        <p class="text-sm text-green-600">+201 since last hour</p>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>

                    <!-- Charts Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Revenue Chart -->
                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-header>
                                <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div #revenueChart class="w-full h-80"></div>
                            </mat-card-content>
                        </mat-card>

                        <!-- Sales Chart -->
                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-header>
                                <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Sales Distribution</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div #salesChart class="w-full h-80"></div>
                            </mat-card-content>
                        </mat-card>

                        <!-- User Activity -->
                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-header>
                                <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">User Activity</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div #userActivityChart class="w-full h-80"></div>
                            </mat-card-content>
                        </mat-card>

                        <!-- Geographic Distribution -->
                        <mat-card class="bg-white dark:bg-gray-800">
                            <mat-card-header>
                                <mat-card-title class="text-lg font-semibold text-gray-900 dark:text-white">Geographic Distribution</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div #geoChart class="w-full h-80"></div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class DashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('revenueChart') revenueChartRef!: ElementRef;
    @ViewChild('salesChart') salesChartRef!: ElementRef;
    @ViewChild('userActivityChart') userActivityChartRef!: ElementRef;
    @ViewChild('geoChart') geoChartRef!: ElementRef;

    searchTerm: string = '';
    selectedDateRange: string = '30';
    filters = {
        categories: {
            sales: true,
            marketing: true,
            finance: true,
            operations: true
        },
        regions: {
            north: true,
            south: true,
            europe: true,
            asia: true
        }
    };

    constructor() {}

    ngOnInit(): void {
        // Initialize component
    }

    ngAfterViewInit(): void {
        this.initializeCharts();
    }

    onSearchChange(): void {
        // Handle search changes
        console.log('Search term:', this.searchTerm);
    }

    onDateRangeChange(): void {
        // Handle date range changes
        console.log('Date range:', this.selectedDateRange);
        this.updateCharts();
    }

    onFilterChange(): void {
        // Handle filter changes
        console.log('Filters:', this.filters);
        this.updateCharts();
    }

    private initializeCharts(): void {
        this.createRevenueChart();
        this.createSalesChart();
        this.createUserActivityChart();
        this.createGeoChart();
    }

    private createRevenueChart(): void {
        if (!am5 || !this.revenueChartRef) return;

        const root = am5.Root.new(this.revenueChartRef.nativeElement);
        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: false,
                panY: false,
                wheelX: "none",
                wheelY: "none"
            })
        );

        const xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                categoryField: "month",
                renderer: am5xy.AxisRendererX.new(root, {}),
                tooltip: am5.Tooltip.new(root, {})
            })
        );

        const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {})
            })
        );

        const series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
                name: "Revenue",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                categoryXField: "month"
            })
        );

        series.columns.template.setAll({
            tooltipText: "{name}, {categoryX}:{valueY}",
            width: am5.percent(90),
            tooltipY: 0
        });

        series.set("colors", am5.ColorSet.new(root, {
            colors: [am5.color(0x8FD2D2), am5.color(0x15616D)]
        }));

        const data = [
            { month: "Jan", value: 1000 },
            { month: "Feb", value: 1200 },
            { month: "Mar", value: 1400 },
            { month: "Apr", value: 1600 },
            { month: "May", value: 1800 },
            { month: "Jun", value: 2000 }
        ];

        xAxis.data.setAll(data);
        series.data.setAll(data);
    }

    private createSalesChart(): void {
        if (!am5 || !this.salesChartRef) return;

        const root = am5.Root.new(this.salesChartRef.nativeElement);
        const chart = root.container.children.push(
            am5percent.PieChart.new(root, {})
        );

        const series = chart.series.push(
            am5percent.PieSeries.new(root, {
                name: "Sales",
                categoryField: "category",
                valueField: "value"
            })
        );

        series.set("colors", am5.ColorSet.new(root, {
            colors: [am5.color(0x8FD2D2), am5.color(0x15616D), am5.color(0x0E3F2D), am5.color(0xA0A0A0)]
        }));

        const data = [
            { category: "Product A", value: 35 },
            { category: "Product B", value: 25 },
            { category: "Product C", value: 20 },
            { category: "Product D", value: 20 }
        ];

        series.data.setAll(data);
    }

    private createUserActivityChart(): void {
        if (!am5 || !this.userActivityChartRef) return;

        const root = am5.Root.new(this.userActivityChartRef.nativeElement);
        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: false,
                panY: false,
                wheelX: "none",
                wheelY: "none"
            })
        );

        const xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                categoryField: "hour",
                renderer: am5xy.AxisRendererX.new(root, {})
            })
        );

        const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {})
            })
        );

        const series = chart.series.push(
            am5xy.LineSeries.new(root, {
                name: "Users",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                categoryXField: "hour"
            })
        );

        series.strokes.template.setAll({
            strokeWidth: 3,
            stroke: am5.color(0x8FD2D2)
        });

        const data = [
            { hour: "00", value: 100 },
            { hour: "04", value: 80 },
            { hour: "08", value: 200 },
            { hour: "12", value: 300 },
            { hour: "16", value: 250 },
            { hour: "20", value: 180 }
        ];

        xAxis.data.setAll(data);
        series.data.setAll(data);
    }

    private createGeoChart(): void {
        if (!am5 || !this.geoChartRef) return;

        const root = am5.Root.new(this.geoChartRef.nativeElement);
        const chart = root.container.children.push(
            am5map.MapChart.new(root, {
                panX: "translateX",
                panY: "translateY",
                projection: am5map.geoAlbersUsa()
            })
        );

        const polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_worldLow,
                valueField: "value",
                calculateAggregates: true
            })
        );

        polygonSeries.mapPolygons.template.setAll({
            tooltipText: "{name}: {value}",
            interactive: true,
            fill: am5.color(0x8FD2D2)
        });

        const data = [
            { id: "US", value: 100 },
            { id: "CA", value: 80 },
            { id: "MX", value: 60 },
            { id: "BR", value: 40 },
            { id: "AR", value: 30 }
        ];

        polygonSeries.data.setAll(data);
    }

    private updateCharts(): void {
        // Update charts based on filters
        console.log('Updating charts with new filters');
    }
} 