import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

import { AuthService, LoginCredentials } from "../../../core/auth/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 to-cyan-800 py-24 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8">
        <!-- Logo -->
        <div class="text-center">
          <img
            class="mx-auto h-32 w-auto"
            src="https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/Nextera%20Logo%20Career%20Insight%20White%20text.png"
            alt="Nextera Logo"
          />
         
        </div>

        <!-- Login Form -->
        <mat-card class="bg-white shadow-xl rounded-lg p-4">
          <mat-card-content class="p-20">
            <div class="text-center mb-6">
               <h2 class="mt-6 text-3xl font-extrabold">
              Sign in to your account
            </h2>
              <p class="mt-2 text-sm ">Welcome to DataViz Dashboard</p>
            </div>
            
            <form
              [formGroup]="loginForm"
              (ngSubmit)="onSubmit($event)"
              class="space-y-6 padding-bottom-8"
            >
              <!-- Email Field -->
              <mat-form-field class="w-full">
                <mat-label>Email address</mat-label>
                <input
                  matInput
                  type="email"
                   required="true"
                  formControlName="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  [class.error]="hasError('email')"
                />
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field class="w-full mb-4">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  required="true"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  [class.error]="hasError('password')"
                />
                <button
                  mat-icon-button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  matSuffix
                  class="cursor-pointer mt-1"
                >
                  <mat-icon>
                    {{ showPassword ? "visibility_off" : "visibility" }}
                  </mat-icon>
                </button>
                <mat-error
                  *ngIf="loginForm.get('password')?.hasError('required')"
                >
                  Password is required
                </mat-error>
              </mat-form-field>

              <!-- Error Message -->
              <div
                *ngIf="errorMessage"
                class="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div class="flex items-center">
                  <mat-icon class="text-red-500 mr-2">error</mat-icon>
                  <span class="text-sm text-red-700">{{ errorMessage }}</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                mat-raised-button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="w-full h-12 text-lg bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 mb-8 flex items-center justify-center"
                style="background-color: #2563eb; color: #fff;"
              >
                <div class="flex items-center justify-center">
                  <mat-spinner
                    *ngIf="isLoading"
                    diameter="20"
                    class="mr-2"
                  ></mat-spinner>
                  
                  <span *ngIf="isLoading">Signing in...</span>
                </div>
                <span *ngIf="!isLoading">Sign in</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(["/dashboard"]);
    }

    // Clear error message when form changes
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = "";
    });
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";
      const credentials: LoginCredentials = this.loginForm.value;

      try {
        const user = await this.authService.userLogin(credentials?.email, credentials?.password);
        this.isLoading = false;
        if (!user || !user.user) {
          this.snackBar.open(`Login failed. Please check your credentials.`, "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });

          throw new Error("Login failed. Please check your credentials.");
        }

        this.snackBar.open(`Welcome back, ${user.user.lastName} ${user.user.firstName}!`, "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        this.router.navigate(["/admin/dashboard-list"]);
      } catch (error) {
        this.isLoading = false;
        this.errorMessage =
          error.message ||
          "Login failed. Please check your credentials and try again.";

        // Show snackbar for additional feedback
        this.snackBar.open(this.errorMessage, "Close", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
