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
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Production Line Dashboard</h1>
        <p class="dashboard-subtitle">Overview of tasks and equipment status</p>
      </header>

      <section class="section-tasks">
        <h2 class="section-title">
          <mat-icon>assignment</mat-icon>
          Tasks
        </h2>
        <div class="kpi-row">
          <div class="kpi-card kpi-primary">
            <span class="kpi-value">{{ stats.total }}</span>
            <span class="kpi-label">Total Tasks</span>
          </div>
          @for (s of stats.byStatus; track s.status) {
            <div class="kpi-card" [class]="'status-' + s.status">
              <span class="kpi-value">{{ s.count }}</span>
              <span class="kpi-label">{{ formatLabel(s.status) }}</span>
            </div>
          }
        </div>
        <div class="breakdown-grid">
          <div class="breakdown-card">
            <h3>By Priority</h3>
            <div class="breakdown-list">
              @for (p of stats.byPriority; track p.priority) {
                <div class="breakdown-item" [class]="'priority-' + p.priority">
                  <span class="breakdown-label">{{ p.priority | uppercase }}</span>
                  <span class="breakdown-value">{{ p.count }}</span>
                </div>
              }
            </div>
          </div>
          <div class="breakdown-card">
            <h3>By Production Line</h3>
            <div class="breakdown-list">
              @for (l of stats.byProductionLine; track l.production_line) {
                <div class="breakdown-item">
                  <span class="breakdown-label">{{ l.production_line }}</span>
                  <span class="breakdown-value">{{ l.count }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <section class="section-equipment">
        <h2 class="section-title">
          <mat-icon>precision_manufacturing</mat-icon>
          Equipment
        </h2>
        <div class="kpi-row">
          <div class="kpi-card kpi-primary">
            <span class="kpi-value">{{ equipmentStats.total }}</span>
            <span class="kpi-label">Total Equipment</span>
          </div>
          @for (e of equipmentStats.byStatus; track e.status) {
            <div class="kpi-card" [class]="'equipment-' + e.status">
              <span class="kpi-value">{{ e.count }}</span>
              <span class="kpi-label">{{ formatLabel(e.status) }}</span>
            </div>
          }
        </div>
        <div class="breakdown-grid">
          <div class="breakdown-card">
            <h3>By Type</h3>
            <div class="breakdown-list">
              @for (t of equipmentStats.byType; track t.type) {
                <div class="breakdown-item">
                  <span class="breakdown-label">{{ t.type | uppercase }}</span>
                  <span class="breakdown-value">{{ t.count }}</span>
                </div>
              }
            </div>
          </div>
          <div class="breakdown-card">
            <h3>Equipment by Line</h3>
            <div class="breakdown-list">
              @for (el of (equipmentStats.byProductionLine || []); track el.production_line) {
                <div class="breakdown-item">
                  <span class="breakdown-label">{{ el.production_line }}</span>
                  <span class="breakdown-value">{{ el.count }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
      font-family: 'Roboto', 'Helvetica Neue', sans-serif;
    }
    .dashboard-header {
      margin-bottom: 32px;
    }
    .dashboard-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 4px 0;
      letter-spacing: -0.02em;
    }
    .dashboard-subtitle {
      font-size: 0.9375rem;
      color: #64748b;
      margin: 0;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 16px 0;
    }
    .section-title mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #6366f1;
    }
    .section-tasks, .section-equipment {
      margin-bottom: 40px;
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      transition: box-shadow 0.2s;
    }
    .kpi-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .kpi-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #fff;
      border: none;
    }
    .kpi-primary .kpi-label { color: rgba(255,255,255,0.9); }
    .kpi-value {
      display: block;
      font-size: 1.875rem;
      font-weight: 700;
      line-height: 1.2;
      color: #1a1a2e;
    }
    .kpi-label {
      font-size: 0.8125rem;
      color: #64748b;
      margin-top: 4px;
    }
    .kpi-card.status-todo { border-left: 4px solid #3b82f6; }
    .kpi-card.status-in_progress { border-left: 4px solid #f59e0b; }
    .kpi-card.status-review { border-left: 4px solid #8b5cf6; }
    .kpi-card.status-done { border-left: 4px solid #22c55e; }
    .kpi-card.priority-critical { border-left: 4px solid #ef4444; }
    .kpi-card.priority-high { border-left: 4px solid #f59e0b; }
    .kpi-card.priority-medium { border-left: 4px solid #3b82f6; }
    .kpi-card.priority-low { border-left: 4px solid #22c55e; }
    .kpi-card.equipment-available { border-left: 4px solid #22c55e; }
    .kpi-card.equipment-in_use { border-left: 4px solid #3b82f6; }
    .kpi-card.equipment-maintenance { border-left: 4px solid #f59e0b; }
    .kpi-card.equipment-offline { border-left: 4px solid #ef4444; }
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .breakdown-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .breakdown-card h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .breakdown-label {
      font-size: 0.9375rem;
      color: #334155;
    }
    .breakdown-value {
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a2e;
    }
    .breakdown-item.priority-critical .breakdown-value { color: #ef4444; }
    .breakdown-item.priority-high .breakdown-value { color: #f59e0b; }
    .breakdown-item.priority-medium .breakdown-value { color: #3b82f6; }
    .breakdown-item.priority-low .breakdown-value { color: #22c55e; }
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
          this.stats = this._normalizeTaskStats(data);
          this.cdr.detectChanges();
        }
      },
      error: () => {},
    });

    this.equipmentService.getStatistics().subscribe({
      next: (data) => {
        if (this._hasEquipmentData(data)) {
          this.equipmentStats = this._normalizeEquipmentStats(data);
          this.cdr.detectChanges();
        }
      },
      error: () => {},
    });
  }

  private _normalizeTaskStats(data: TaskStatistics): TaskStatistics {
    return {
      total: Number(data.total) || 0,
      byStatus: (data.byStatus ?? []).map((s) => ({ status: s.status, count: Number(s.count) || 0 })),
      byPriority: (data.byPriority ?? []).map((p) => ({ priority: p.priority, count: Number(p.count) || 0 })),
      byProductionLine: (data.byProductionLine ?? []).map((l) => ({ production_line: l.production_line, count: Number(l.count) || 0 })),
    };
  }

  private _normalizeEquipmentStats(data: EquipmentStatistics): EquipmentStatistics {
    return {
      total: Number(data.total) || 0,
      byStatus: (data.byStatus ?? []).map((s) => ({ status: s.status, count: Number(s.count) || 0 })),
      byType: (data.byType ?? []).map((t) => ({ type: t.type, count: Number(t.count) || 0 })),
      byProductionLine: (data.byProductionLine ?? []).map((l) => ({ production_line: l.production_line, count: Number(l.count) || 0 })),
    };
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
