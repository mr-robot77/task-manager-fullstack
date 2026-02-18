import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width"
                    [disabled]="loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
          <p style="text-align: center; margin-top: 16px">
            Don't have an account? <a routerLink="/register">Register</a>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 60vh;
    }
    mat-card { width: 100%; max-width: 400px; padding: 24px; }
    .full-width { width: 100%; }
    form { display: flex; flex-direction: column; gap: 8px; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onLogin(): void {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000, panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Invalid credentials', 'Close', {
          duration: 3000, panelClass: ['error-snackbar']
        });
      }
    });
  }
}
