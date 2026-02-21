import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Task, TaskService, TaskFilters } from '../../services/task.service';

const DEMO_TASKS: Task[] = [
  { id: 1, title: 'Calibrate wafer handler sensors', status: 'in_progress', priority: 'high', productionLine: 'Line A', equipment: { id: 1, name: 'Wafer Handler Robot #1', code: 'WH-ROB-001', type: 'robot', status: 'in_use', productionLine: 'Line A' } },
  { id: 2, title: 'Quarterly lithography alignment', status: 'review', priority: 'critical', productionLine: 'Line A', equipment: { id: 2, name: 'Lithography Stepper', code: 'LITH-STEP-01', type: 'machine', status: 'in_use', productionLine: 'Line A' } },
  { id: 3, title: 'Conveyor belt speed optimization', status: 'todo', priority: 'medium', productionLine: 'Line A', equipment: { id: 3, name: 'Conveyor Belt A', code: 'CONV-A-01', type: 'conveyor', status: 'available', productionLine: 'Line A' } },
  { id: 4, title: 'Temperature drift analysis', status: 'done', priority: 'low', productionLine: 'Line B', equipment: { id: 4, name: 'Temperature Sensor Bank', code: 'TEMP-SNS-01', type: 'sensor', status: 'available', productionLine: 'Line B' } },
  { id: 5, title: 'Replace etching chamber filters', status: 'in_progress', priority: 'high', productionLine: 'Line B', equipment: { id: 5, name: 'Etching Tool Set', code: 'ETCH-TL-001', type: 'tooling', status: 'maintenance', productionLine: 'Line B' } },
];

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatSelectModule,
    MatIconModule, MatFormFieldModule, MatSnackBarModule
  ],
  template: `
    <div class="header">
      <h1>Production Tasks</h1>
      <a mat-raised-button color="primary" routerLink="/tasks/new">
        <mat-icon>add</mat-icon> New Task
      </a>
    </div>

    <div class="filters">
      <mat-form-field>
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="filters.status" (selectionChange)="loadTasks()">
          <mat-option value="">All</mat-option>
          <mat-option value="todo">To Do</mat-option>
          <mat-option value="in_progress">In Progress</mat-option>
          <mat-option value="review">Review</mat-option>
          <mat-option value="done">Done</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Priority</mat-label>
        <mat-select [(ngModel)]="filters.priority" (selectionChange)="loadTasks()">
          <mat-option value="">All</mat-option>
          <mat-option value="low">Low</mat-option>
          <mat-option value="medium">Medium</mat-option>
          <mat-option value="high">High</mat-option>
          <mat-option value="critical">Critical</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <table mat-table [dataSource]="tasks" class="mat-elevation-z4 full-width">
      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let task">{{ task.title }}</td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let task">
          <span class="chip" [class]="'status-' + task.status">{{ task.status }}</span>
        </td>
      </ng-container>
      <ng-container matColumnDef="priority">
        <th mat-header-cell *matHeaderCellDef>Priority</th>
        <td mat-cell *matCellDef="let task">
          <span class="chip" [class]="'priority-' + task.priority">{{ task.priority }}</span>
        </td>
      </ng-container>
      <ng-container matColumnDef="productionLine">
        <th mat-header-cell *matHeaderCellDef>Line</th>
        <td mat-cell *matCellDef="let task">{{ task.productionLine }}</td>
      </ng-container>
      <ng-container matColumnDef="equipment">
        <th mat-header-cell *matHeaderCellDef>Equipment</th>
        <td mat-cell *matCellDef="let task">
          {{ task.equipment ? (task.equipment.code + ' - ' + task.equipment.name) : '-' }}
        </td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let task">
          <a mat-icon-button [routerLink]="['/tasks', task.id, 'edit']"><mat-icon>edit</mat-icon></a>
          <button mat-icon-button color="warn" (click)="deleteTask(task.id!)"><mat-icon>delete</mat-icon></button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; }
    .filters { display: flex; gap: 16px; margin: 16px 0; }
    .full-width { width: 100%; }
    .chip {
      padding: 4px 10px; border-radius: 12px; font-size: 12px;
      text-transform: uppercase; font-weight: 500;
    }
    .status-todo { background: #e3f2fd; color: #1565c0; }
    .status-in_progress { background: #fff3e0; color: #e65100; }
    .status-review { background: #f3e5f5; color: #7b1fa2; }
    .status-done { background: #e8f5e9; color: #2e7d32; }
    .priority-critical { background: #ffebee; color: #c62828; }
    .priority-high { background: #fff3e0; color: #e65100; }
    .priority-medium { background: #e3f2fd; color: #1565c0; }
    .priority-low { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filters: TaskFilters = {};
  displayedColumns = ['title', 'status', 'priority', 'productionLine', 'equipment', 'actions'];

  constructor(private taskService: TaskService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.filters).subscribe({
      next: (tasks) => this.tasks = tasks?.length ? tasks : DEMO_TASKS,
      error: () => {
        this.tasks = DEMO_TASKS;
        this.snackBar.open('Showing demo data (backend unavailable)', 'Close', { duration: 3000 });
      },
    });
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.snackBar.open('Task deleted', 'Close', { duration: 2000 });
          this.loadTasks();
        },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
      });
    }
  }
}
