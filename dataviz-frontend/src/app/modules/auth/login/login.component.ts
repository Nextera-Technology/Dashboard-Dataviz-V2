import { Component, OnInit, HostListener } from "@angular/core";
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
import { NotificationService } from '@dataviz/services/notification/notification.service';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { TranslationService } from 'app/shared/services/translation/translation.service';

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
    TranslatePipe,
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
    private snackBar: MatSnackBar,
    private notifier: NotificationService,
    public translation: TranslationService
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });

    this.loginForm.markAsUntouched();
  }

  langMenuOpen = false;

  setLanguage(lang: string): void {
    this.translation.setLanguage(lang);
    const msg = this.translation.translate('shared.language_changed') || 'Language changed';
    this.snackBar.open(msg, 'Close', { duration: 1500 });
    this.langMenuOpen = false;
  }

  getCurrentLanguage(): string {
    return this.translation.getCurrentLanguage();
  }

  @HostListener('document:click')
  closeLangMenu(): void {
    this.langMenuOpen = false;
  }

  openLangMenu(event: Event): void {
    event.stopPropagation();
    this.langMenuOpen = !this.langMenuOpen;
  }

  currentFlag(): string {
    const lang = this.translation.getCurrentLanguage?.() || this.translation.getCurrentLanguage();
    if (lang === 'fr') return 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/fr.svg';
    return 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/flags/4x3/gb.svg';
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
      const previousValues = { ...credentials }; // simpan nilai saat submit

      try {
        const user = await this.authService.userLogin(credentials?.email, credentials?.password);
        this.isLoading = false;
        if (!user || !user.user) {
          await this.notifier.errorKey('notifications.login_failed');

          throw new Error("Login failed");
        }

        await this.notifier.successKey('notifications.welcome_back', { name: `${user.user.lastName} ${user.user.firstName}` });
        this.router.navigate(["/admin/dashboard-list"]);
      } catch (error) {
        this.isLoading = false;
        
        // restore nilai dulu (jika komponen sempat di-reset/reinitialized)
        this.loginForm.patchValue(previousValues);
        
        // lalu set errorMessage setelah patchValue, agar tidak ter-clear oleh valueChanges
        this.errorMessage =
          error.message ||
          "Oops! That email or password doesn’t match. Try again";

        // Show snackbar for additional feedback
        await this.notifier.errorKey('notifications.login_failed');
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();

      // Show a consistent login-failed message and snackbar even when the form is invalid
      this.errorMessage = "Oops! That email or password doesn’t match. Try again";
      await this.notifier.errorKey('notifications.login_failed');
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
