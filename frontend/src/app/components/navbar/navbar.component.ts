import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <mat-icon class="brand-icon">factory</mat-icon>
      <span class="brand-text">Operations Manager</span>
      <span class="spacer"></span>

      <nav class="nav-desktop">
        <a mat-button routerLink="/dashboard" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a mat-button routerLink="/tasks" routerLinkActive="active-link">
          <mat-icon>list</mat-icon> Tasks
        </a>
        <a mat-button routerLink="/equipment" routerLinkActive="active-link">
          <mat-icon>precision_manufacturing</mat-icon> Equipment
        </a>
        @if (isLoggedIn$ | async) {
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        } @else {
          <a mat-button routerLink="/login" routerLinkActive="active-link">
            <mat-icon>login</mat-icon> Login
          </a>
        }
      </nav>

      <div class="nav-mobile">
        <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Menu">
          <mat-icon>menu</mat-icon>
        </button>
        <mat-menu #menu="matMenu" xPosition="before">
          <a mat-menu-item routerLink="/dashboard" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-menu-item routerLink="/tasks" routerLinkActive="active-link">
            <mat-icon>list</mat-icon>
            <span>Tasks</span>
          </a>
          <a mat-menu-item routerLink="/equipment" routerLinkActive="active-link">
            <mat-icon>precision_manufacturing</mat-icon>
            <span>Equipment</span>
          </a>
          @if (isLoggedIn$ | async) {
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          } @else {
            <a mat-menu-item routerLink="/login" routerLinkActive="active-link">
              <mat-icon>login</mat-icon>
              <span>Login</span>
            </a>
          }
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .active-link { background: rgba(255,255,255,0.1); }
    .toolbar { gap: 4px; flex-wrap: wrap; min-height: 56px; }
    .brand-icon { margin-left: 4px; }
    .brand-text { margin-left: 8px; font-size: 1rem; }
    .spacer { flex: 1 1 auto; }
    .nav-desktop { display: flex; gap: 4px; }
    .nav-mobile { display: none; }
    @media (max-width: 768px) {
      .brand-text { font-size: 0.9rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .nav-desktop { display: none; }
      .nav-mobile { display: block; }
    }
  `]
})
export class NavbarComponent {
  isLoggedIn$ = this.authService.isAuthenticated();

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
