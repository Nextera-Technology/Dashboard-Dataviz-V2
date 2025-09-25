import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { DashboardFormDialogComponent, DashboardFormDialogData } from '../../components/dashboard-form-dialog/dashboard-form-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-description-create',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AdminLayoutComponent,
    TranslatePipe
  ],
  template: `
    <app-admin-layout>
      <div class="job-description-create-container">
        <div class="header-section">
          <h2>{{ 'admin.jobDescriptionCreate.page_title' | translate }}</h2>
        </div>

        <div class="create-section">
          <div class="create-card">
            <div class="card-icon">
              <mat-icon>work_outline</mat-icon>
            </div>
            <h3>{{ 'admin.jobDescriptionCreate.create_card_title' | translate }}</h3>
            <p>{{ 'admin.jobDescriptionCreate.create_card_description' | translate }}</p>
            <button mat-raised-button color="primary" (click)="openCreateJobDescriptionDialog()" class="create-btn">
              <mat-icon>work</mat-icon>
              {{ 'admin.jobDescriptionCreate.create_button' | translate }}
            </button>
          </div>

          <div class="info-card">
            <div class="card-icon">
              <mat-icon>info_outline</mat-icon>
            </div>
            <h3>{{ 'admin.jobDescriptionCreate.tips_title' | translate }}</h3>
            <ul>
              <li>{{ 'admin.jobDescriptionCreate.tips.tip1' | translate }}</li>
              <li>{{ 'admin.jobDescriptionCreate.tips.tip2' | translate }}</li>
              <li>{{ 'admin.jobDescriptionCreate.tips.tip3' | translate }}</li>
              <li>{{ 'admin.jobDescriptionCreate.tips.tip4' | translate }}</li>
              <li>{{ 'admin.jobDescriptionCreate.tips.tip5' | translate }}</li>
            </ul>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .job-description-create-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .header-section h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    .create-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      max-width: 800px;
      margin: 0 auto;
    }

    .create-card, .info-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .create-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .card-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .create-card h3, .info-card h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    }

    .create-card p, .info-card p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 25px;
    }

    .create-btn {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      text-transform: none;
    }

    .create-btn mat-icon {
      margin-right: 8px;
    }

    .info-card {
      text-align: left;
    }

    .info-card .card-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .info-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-card li {
      padding: 8px 0;
      position: relative;
      padding-left: 24px;
      color: #555;
      line-height: 1.5;
    }

    .info-card li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #4facfe;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .create-section {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .create-card, .info-card {
        padding: 20px;
      }
    }
  `]
})
export class JobDescriptionCreateComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {}

  openCreateJobDescriptionDialog(): void {
    const dialogRef = this.dialog.open<
      DashboardFormDialogComponent,
      DashboardFormDialogData,
      any
    >(DashboardFormDialogComponent, {
      width: "600px",
      data: {
        typeOfUsage: 'JOB_DESCRIPTION_EVALUATION'
      },
      panelClass: 'modern-dialog',
      backdropClass: 'modern-backdrop',
    });

    dialogRef.afterClosed().subscribe((result) => {
      // If dialog returned a dashboard id (string), navigate to job description list and show it
      if (typeof result === 'string' && result.length > 0) {
        this.router.navigate(['/admin/job-description']);
      } else if (result === true) {
        // Job description created successfully, navigate to job description list
        this.router.navigate(['/admin/job-description']);
      }
    });
  }
}
