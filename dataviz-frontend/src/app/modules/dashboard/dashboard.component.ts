import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService, User } from '../../core/auth/auth.service';

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
        MatSlideToggleModule,
        MatMenuModule,
        MatSnackBarModule
    ],
    template: `
        <div class="dashboard-container">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="logo-container">
                    <img 
                        src="https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/Nextera%20Logo%20Career%20Insight%20White%20text.png"
                        alt="Nextera Logo"
                    />
                </div>

                <!-- User Info -->
                <div class="user-info">
                    <div class="user-avatar">
                        <mat-icon>person</mat-icon>
                    </div>
                    <div class="user-details">
                        <p class="user-name">{{ currentUser?.name }}</p>
                        <p class="user-email">{{ currentUser?.email }}</p>
                        <p class="user-role">{{ currentUser?.role | titlecase }}</p>
                    </div>
                </div>

                <!-- Certification Filter Section -->
                <div class="filter-section">
                    <div class="section-title">
                        <span class="section-icon">📊</span>
                        Certification
                    </div>
                    <div class="typeahead-container">
                        <input 
                            type="text" 
                            class="typeahead-input" 
                            placeholder="Rechercher une Certification..."
                            [(ngModel)]="certificationSearch"
                            (input)="onCertificationSearch()"
                        />
                    </div>
                    <div class="checkbox-list">
                        <div class="checkbox-item select-all">
                            <input type="checkbox" id="cert_select_all" (change)="toggleCertificationSelectAll()">
                            <label for="cert_select_all">Sélectionner tout</label>
                        </div>
                        <div class="checkbox-item" *ngFor="let cert of filteredCertifications">
                            <input type="checkbox" [id]="'cert_' + cert.id" [(ngModel)]="cert.selected">
                            <label [for]="'cert_' + cert.id">{{ cert.name }}</label>
                        </div>
                    </div>
                    <div class="selected-count">{{ selectedCertificationsCount }} certification(s) sélectionnée(s)</div>
                    <button class="clear-filters" (click)="applyCertificationFilters()">Appliquer les Filtres</button>
                </div>

                <!-- Sections Filter Section -->
                <div class="filter-section">
                    <div class="section-title sections-title">
                        <span class="section-icon">📋</span>
                        Sections
                    </div>
                    <div class="checkbox-list">
                        <div class="checkbox-item" *ngFor="let section of sections">
                            <input type="checkbox" [id]="'section_' + section.id" [(ngModel)]="section.selected">
                            <label [for]="'section_' + section.id">{{ section.name }}</label>
                        </div>
                    </div>
                    <div class="selected-count">{{ selectedSectionsCount }} section(s) sélectionnée(s)</div>
                    <button class="clear-filters" (click)="applySectionFilters()">Appliquer les Filtres</button>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="main-content">
                <header>
                    <div class="header-content">
                        <h1>RDC 2022 - Enquêtes d'Employabilité</h1>
                        <h4>EE1 : Certification &nbsp;| &nbsp;EE2 : Après 6 mois &nbsp;| &nbsp;EE3 : Après 12 mois &nbsp;| &nbsp;EE4 : Après 24 mois</h4>
                    </div>
                    
                    <!-- User Menu -->
                    <div class="user-menu">
                        <button 
                            mat-icon-button 
                            [matMenuTriggerFor]="userMenu"
                            class="user-menu-button"
                        >
                            <mat-icon>account_circle</mat-icon>
                        </button>
                        <mat-menu #userMenu="matMenu">
                            <div class="menu-header">
                                <p class="menu-name">{{ currentUser?.name }}</p>
                                <p class="menu-email">{{ currentUser?.email }}</p>
                                <p class="menu-role">{{ currentUser?.role | titlecase }}</p>
                            </div>
                            <button mat-menu-item (click)="logout()">
                                <mat-icon>logout</mat-icon>
                                <span>Logout</span>
                            </button>
                        </mat-menu>
                    </div>
                </header>

                <!-- Dashboard Content -->
                <div class="dashboard-content">
                    
                </div>
            </main>
        </div>
    `,
    styles: [`
        /* Dashboard Container */
        .dashboard-container {
            display: flex;
            min-height: 100vh;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: #F5F8FA;
        }

        /* Sidebar Styles - Matching Static Dashboard */
        .sidebar {
            width: 240px;
            height: 100vh;
            background: linear-gradient(135deg, #97cce4 0%, #306e8b 100%);
            color: white;
            padding: 20px;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;
        }

        /* Logo Container */
        .logo-container {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo-container img {
            max-width: 200px;
            height: auto;
        }

        /* User Info */
        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 25px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-avatar mat-icon {
            color: white;
            font-size: 20px;
            width: 20px;
            height: 20px;
        }

        .user-details {
            flex: 1;
        }

        .user-name {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 2px 0;
            color: white;
        }

        .user-email {
            font-size: 12px;
            margin: 0 0 2px 0;
            color: rgba(255, 255, 255, 0.8);
        }

        .user-role {
            font-size: 11px;
            margin: 0;
            color: rgba(255, 255, 255, 0.7);
            text-transform: capitalize;
        }

        /* Filter Section */
        .filter-section {
            margin-bottom: 25px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .section-icon {
            font-size: 18px;
        }

        /* Typeahead Input */
        .typeahead-container {
            position: relative;
            margin-bottom: 15px;
        }

        .typeahead-input {
            width: 100%;
            padding: 12px 16px;
            border: none;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .typeahead-input:focus {
            outline: none;
            background: white;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .typeahead-input::placeholder {
            color: #666;
        }

        /* Checkbox List */
        .checkbox-list {
            max-height: 300px;
            overflow-y: auto;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            border-radius: 6px;
            margin-bottom: 4px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .checkbox-item:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .checkbox-item.select-all {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            font-weight: 600;
            margin-bottom: 8px;
        }

        .checkbox-item input[type="checkbox"] {
            margin-right: 10px;
            transform: scale(1.1);
            accent-color: #4CAF50;
        }

        .checkbox-item label {
            cursor: pointer;
            font-size: 14px;
            font-weight: 400;
            flex: 1;
            color: rgba(255, 255, 255, 0.9);
        }

        /* Clear Filters Button */
        .clear-filters {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            margin-top: 10px;
            transition: all 0.3s ease;
            width: 100%;
        }

        .clear-filters:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* Selected Count */
        .selected-count {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 8px;
        }

        /* Custom Scrollbar */
        .sidebar::-webkit-scrollbar,
        .checkbox-list::-webkit-scrollbar {
            width: 6px;
        }

        .sidebar::-webkit-scrollbar-track,
        .checkbox-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        .sidebar::-webkit-scrollbar-thumb,
        .checkbox-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover,
        .checkbox-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }

        /* Main Content */
        .main-content {
            margin-left: 240px;
            padding: 20px;
            flex: 1;
            background-color: #F5F8FA;
        }

        /* Header */
        header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }

        .header-content h1 {
            font-size: 24px;
            color: #0E3F2D;
            margin: 0 0 5px 0;
        }

        .header-content h4 {
            color: #0E3F2D;
            margin: 0;
            font-size: 14px;
            font-weight: 400;
        }

        /* User Menu */
        .user-menu {
            display: flex;
            align-items: center;
        }

        .user-menu-button {
            color: #15616D;
        }

        .menu-header {
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
        }

        .menu-name {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 2px 0;
            color: #374151;
        }

        .menu-email {
            font-size: 12px;
            margin: 0 0 2px 0;
            color: #6b7280;
        }

        .menu-role {
            font-size: 11px;
            margin: 0;
            color: #9ca3af;
            text-transform: capitalize;
        }

        /* Dashboard Content */
        .dashboard-content {
            padding: 0;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
            .sidebar {
                width: 240px;
            }

            .main-content {
                margin-left: 240px;
            }
        }

        @media (max-width: 640px) {
            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
            }

            .main-content {
                margin-left: 0;
            }
        }
    `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('revenueChart') revenueChartRef!: ElementRef;
    @ViewChild('salesChart') salesChartRef!: ElementRef;
    @ViewChild('userActivityChart') userActivityChartRef!: ElementRef;
    @ViewChild('geoChart') geoChartRef!: ElementRef;

    currentUser: User | null = null;
    certificationSearch: string = '';
    selectedCertificationsCount: number = 0;
    selectedSectionsCount: number = 0;

    // Mock data for certifications
    certifications = [
        { id: 1, name: 'Certification A', selected: false },
        { id: 2, name: 'Certification B', selected: false },
        { id: 3, name: 'Certification C', selected: false },
        { id: 4, name: 'Certification D', selected: false },
        { id: 5, name: 'Certification E', selected: false }
    ];

    // Mock data for sections
    sections = [
        { id: 1, name: 'Global', selected: false },
        { id: 2, name: 'Emploi', selected: false },
        { id: 3, name: 'Compétences', selected: false },
        { id: 4, name: 'Salaires', selected: false },
        { id: 5, name: 'Domaines', selected: false }
    ];

    get filteredCertifications() {
        if (!this.certificationSearch) {
            return this.certifications;
        }
        return this.certifications.filter(cert => 
            cert.name.toLowerCase().includes(this.certificationSearch.toLowerCase())
        );
    }

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        if (!this.currentUser) {
            this.router.navigate(['/auth/login']);
        }
        this.updateCounts();
    }

    ngAfterViewInit(): void {
        this.initializeCharts();
    }

    logout(): void {
        this.authService.logout();
        this.snackBar.open('Logged out successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
        this.router.navigate(['/auth/login']);
    }

    onCertificationSearch(): void {
        // Handle certification search
        console.log('Certification search:', this.certificationSearch);
    }

    toggleCertificationSelectAll(): void {
        const selectAll = this.certifications.find(cert => cert.id === 0);
        if (selectAll) {
            this.certifications.forEach(cert => {
                cert.selected = selectAll.selected;
            });
        }
        this.updateCounts();
    }

    applyCertificationFilters(): void {
        console.log('Applying certification filters');
        this.snackBar.open('Certification filters applied', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
    }

    applySectionFilters(): void {
        console.log('Applying section filters');
        this.snackBar.open('Section filters applied', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
    }

    updateCounts(): void {
        this.selectedCertificationsCount = this.certifications.filter(cert => cert.selected).length;
        this.selectedSectionsCount = this.sections.filter(section => section.selected).length;
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
} 