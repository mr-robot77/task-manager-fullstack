import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TaskService, TaskStatistics } from '../../services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <h1>Production Line Dashboard</h1>

    <div class="stats-grid">
      <mat-card class="stat-card total">
        <mat-card-content>
          <mat-icon>assignment</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ stats?.total || 0 }}</span>
            <span class="stat-label">Total Tasks</span>
          </div>
        </mat-card-content>
      </mat-card>

      @for (s of stats?.byStatus; track s.status) {
        <mat-card class="stat-card" [class]="'status-' + s.status">
          <mat-card-content>
            <div class="stat-info">
              <span class="stat-number">{{ s.count }}</span>
              <span class="stat-label">{{ formatLabel(s.status) }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <h2>By Priority</h2>
    <div class="stats-grid">
      @for (p of stats?.byPriority; track p.priority) {
        <mat-card class="stat-card" [class]="'priority-' + p.priority">
          <mat-card-content>
            <div class="stat-info">
              <span class="stat-number">{{ p.count }}</span>
              <span class="stat-label">{{ p.priority | uppercase }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <h2>By Production Line</h2>
    <div class="stats-grid">
      @for (l of stats?.byProductionLine; track l.production_line) {
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>precision_manufacturing</mat-icon>
            <div class="stat-info">
              <span class="stat-number">{{ l.count }}</span>
              <span class="stat-label">{{ l.production_line }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card mat-card-content {
      display: flex; align-items: center; gap: 12px; padding: 16px;
    }
    .stat-info { display: flex; flex-direction: column; }
    .stat-number { font-size: 2rem; font-weight: bold; }
    .stat-label { font-size: 0.85rem; color: #666; }
    .total { background: #e3f2fd; }
    .status-todo { border-left: 4px solid #2196f3; }
    .status-in_progress { border-left: 4px solid #ff9800; }
    .status-review { border-left: 4px solid #9c27b0; }
    .status-done { border-left: 4px solid #4caf50; }
    .priority-critical { border-left: 4px solid #f44336; }
    .priority-high { border-left: 4px solid #ff9800; }
    .priority-medium { border-left: 4px solid #2196f3; }
    .priority-low { border-left: 4px solid #4caf50; }
    mat-icon { font-size: 32px; width: 32px; height: 32px; color: #1976d2; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: TaskStatistics | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getStatistics().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Failed to load statistics', err)
    });
  }

  formatLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
