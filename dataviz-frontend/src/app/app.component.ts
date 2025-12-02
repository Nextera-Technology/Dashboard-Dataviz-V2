import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService, User } from './core/auth/auth.service';
// import { FloatingChatComponent } from './shared/components/floating-chat/floating-chat.component';
import { SessionMonitorService } from './core/auth/session-monitor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
      <!-- <app-floating-chat></app-floating-chat> -->
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private sessionMonitor: SessionMonitorService) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.sessionMonitor.isSessionValid();
  }
}