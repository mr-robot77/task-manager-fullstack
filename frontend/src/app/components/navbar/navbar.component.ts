import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>factory</mat-icon>
      <span style="margin-left: 8px">Operations Manager</span>
      <span style="flex: 1"></span>

      <a mat-button routerLink="/dashboard" routerLinkActive="active-link">
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
    </mat-toolbar>
  `,
  styles: [`
    .active-link { background: rgba(255,255,255,0.1); }
    mat-toolbar { gap: 4px; }
  `]
})
export class NavbarComponent {
  isLoggedIn$ = this.authService.isAuthenticated();

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
