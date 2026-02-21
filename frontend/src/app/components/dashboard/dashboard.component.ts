import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TaskService, TaskStatistics } from '../../services/task.service';
import { EquipmentService, EquipmentStatistics } from '../../services/equipment.service';

const DEMO_TASK_STATS: TaskStatistics = {
  total: 9,
  byStatus: [
    { status: 'todo', count: 3 },
    { status: 'in_progress', count: 2 },
    { status: 'review', count: 2 },
    { status: 'done', count: 2 },
  ],
  byPriority: [
    { priority: 'critical', count: 2 },
    { priority: 'high', count: 2 },
    { priority: 'medium', count: 4 },
    { priority: 'low', count: 1 },
  ],
  byProductionLine: [
    { production_line: 'Line A', count: 4 },
    { production_line: 'Line B', count: 2 },
    { production_line: 'Line C', count: 2 },
    { production_line: 'General', count: 1 },
  ],
};

const DEMO_EQUIPMENT_STATS: EquipmentStatistics = {
  total: 7,
  byStatus: [
    { status: 'available', count: 3 },
    { status: 'in_use', count: 2 },
    { status: 'maintenance', count: 1 },
    { status: 'offline', count: 1 },
  ],
  byType: [
    { type: 'robot', count: 2 },
    { type: 'machine', count: 2 },
    { type: 'conveyor', count: 1 },
    { type: 'sensor', count: 1 },
    { type: 'tooling', count: 1 },
  ],
  byProductionLine: [
    { production_line: 'Line A', count: 3 },
    { production_line: 'Line B', count: 2 },
    { production_line: 'Line C', count: 2 },
  ],
};

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
            <span class="stat-number">{{ stats.total }}</span>
            <span class="stat-label">Total Tasks</span>
          </div>
        </mat-card-content>
      </mat-card>

      @for (s of stats.byStatus; track s.status) {
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
      @for (p of stats.byPriority; track p.priority) {
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
      @for (l of stats.byProductionLine; track l.production_line) {
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

    <h2>Equipment Overview</h2>
    <div class="stats-grid">
      <mat-card class="stat-card total">
        <mat-card-content>
          <mat-icon>precision_manufacturing</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ equipmentStats.total }}</span>
            <span class="stat-label">Total Equipment</span>
          </div>
        </mat-card-content>
      </mat-card>

      @for (e of equipmentStats.byStatus; track e.status) {
        <mat-card class="stat-card" [class]="'equipment-' + e.status">
          <mat-card-content>
            <div class="stat-info">
              <span class="stat-number">{{ e.count }}</span>
              <span class="stat-label">{{ formatLabel(e.status) }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <h2>Equipment by Type</h2>
    <div class="stats-grid">
      @for (t of equipmentStats.byType; track t.type) {
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>memory</mat-icon>
            <div class="stat-info">
              <span class="stat-number">{{ t.count }}</span>
              <span class="stat-label">{{ t.type | uppercase }}</span>
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
    .equipment-available { border-left: 4px solid #4caf50; }
    .equipment-in_use { border-left: 4px solid #2196f3; }
    .equipment-maintenance { border-left: 4px solid #ff9800; }
    .equipment-offline { border-left: 4px solid #f44336; }
    mat-icon { font-size: 32px; width: 32px; height: 32px; color: #1976d2; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: TaskStatistics = DEMO_TASK_STATS;
  equipmentStats: EquipmentStatistics = DEMO_EQUIPMENT_STATS;

  constructor(
    private taskService: TaskService,
    private equipmentService: EquipmentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
    this.taskService.getStatistics().subscribe({
      next: (data) => {
        if (this._hasData(data)) {
          this.stats = data;
          this.cdr.detectChanges();
        }
      },
      error: () => {},
    });

    this.equipmentService.getStatistics().subscribe({
      next: (data) => {
        if (this._hasEquipmentData(data)) {
          this.equipmentStats = data;
          this.cdr.detectChanges();
        }
      },
      error: () => {},
    });
  }

  private _hasData(s: TaskStatistics | null): boolean {
    return !!s && Number(s.total) > 0;
  }

  private _hasEquipmentData(s: EquipmentStatistics | null): boolean {
    return !!s && Number(s.total) > 0;
  }

  formatLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
