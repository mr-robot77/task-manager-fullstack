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
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule
  ],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onRegister()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput [(ngModel)]="fullName" name="fullName" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required minlength="6">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width"
                    [disabled]="loading">
              {{ loading ? 'Creating account...' : 'Register' }}
            </button>
          </form>
          <p style="text-align: center; margin-top: 16px">
            Already have an account? <a routerLink="/login">Login</a>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 60vh;
    }
    mat-card { width: 100%; max-width: 400px; padding: 24px; }
    .full-width { width: 100%; }
    form { display: flex; flex-direction: column; gap: 8px; }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRegister(): void {
    this.loading = true;
    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.snackBar.open('Registration successful! Please login.', 'Close', {
          duration: 3000, panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.error || 'Registration failed';
        this.snackBar.open(msg, 'Close', {
          duration: 3000, panelClass: ['error-snackbar']
        });
      }
    });
  }
}
