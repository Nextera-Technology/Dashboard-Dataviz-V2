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
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
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

    this.loginForm.markAsUntouched();
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(["/dashboard"]);
    }

    this.loginForm.markAsUntouched();

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
