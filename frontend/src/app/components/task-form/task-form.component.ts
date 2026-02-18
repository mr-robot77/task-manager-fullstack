import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Task, TaskService } from '../../services/task.service';
import { Equipment, EquipmentService } from '../../services/equipment.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule,
    MatNativeDateModule, MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEdit ? 'Edit Task' : 'Create New Task' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()" class="task-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="task.title" name="title" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="task.description" name="description" rows="3"></textarea>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="task.status" name="status">
                <mat-option value="todo">To Do</mat-option>
                <mat-option value="in_progress">In Progress</mat-option>
                <mat-option value="review">Review</mat-option>
                <mat-option value="done">Done</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select [(ngModel)]="task.priority" name="priority">
                <mat-option value="low">Low</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="critical">Critical</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Production Line</mat-label>
            <mat-select [(ngModel)]="task.productionLine" name="productionLine" required>
              <mat-option value="Lithography-A">Lithography-A</mat-option>
              <mat-option value="Lithography-B">Lithography-B</mat-option>
              <mat-option value="Etching-1">Etching-1</mat-option>
              <mat-option value="Deposition-1">Deposition-1</mat-option>
              <mat-option value="Packaging">Packaging</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Assigned Equipment (Optional)</mat-label>
            <mat-select [(ngModel)]="task.equipmentId" name="equipmentId">
              <mat-option [value]="null">None</mat-option>
              @for (item of equipmentOptions; track item.id) {
                <mat-option [value]="item.id">{{ item.code }} - {{ item.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="task.dueDate" name="dueDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <div class="actions">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="loading">
              {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card { max-width: 600px; margin: 0 auto; padding: 24px; }
    .task-form { display: flex; flex-direction: column; gap: 4px; margin-top: 16px; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class TaskFormComponent implements OnInit {
  task: Partial<Task> = {
    title: '', description: '', status: 'todo',
    priority: 'medium', productionLine: '', equipmentId: null
  };
  equipmentOptions: Equipment[] = [];
  isEdit = false;
  loading = false;
  private taskId: number | null = null;

  constructor(
    private taskService: TaskService,
    private equipmentService: EquipmentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEquipmentOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.taskId = +id;
      this.taskService.getTask(this.taskId).subscribe({
        next: (task) => this.task = {
          ...task,
          equipmentId: task.equipment?.id ?? null
        },
        error: () => this.snackBar.open('Task not found', 'Close', { duration: 3000 })
      });
    }
  }

  onSubmit(): void {
    this.loading = true;
    const obs = this.isEdit && this.taskId
      ? this.taskService.updateTask(this.taskId, this.task)
      : this.taskService.createTask(this.task);

    obs.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Task updated' : 'Task created', 'Close', { duration: 2000 }
        );
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.error || 'Operation failed';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  private loadEquipmentOptions(): void {
    this.equipmentService.getEquipmentList().subscribe({
      next: (items) => this.equipmentOptions = items,
      error: () => this.snackBar.open('Failed to load equipment options', 'Close', { duration: 3000 })
    });
  }
}
