import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Equipment, EquipmentService } from '../../services/equipment.service';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEdit ? 'Edit Equipment' : 'Create New Equipment' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()" class="equipment-form">
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput [(ngModel)]="equipment.name" name="name" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Code</mat-label>
              <input matInput [(ngModel)]="equipment.code" name="code" required>
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="equipment.type" name="type" required>
                <mat-option value="machine">Machine</mat-option>
                <mat-option value="robot">Robot</mat-option>
                <mat-option value="conveyor">Conveyor</mat-option>
                <mat-option value="sensor">Sensor</mat-option>
                <mat-option value="tooling">Tooling</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="equipment.status" name="status" required>
                <mat-option value="available">Available</mat-option>
                <mat-option value="in_use">In Use</mat-option>
                <mat-option value="maintenance">Maintenance</mat-option>
                <mat-option value="offline">Offline</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Production Line</mat-label>
            <mat-select [(ngModel)]="equipment.productionLine" name="productionLine" required>
              <mat-option value="Lithography-A">Lithography-A</mat-option>
              <mat-option value="Lithography-B">Lithography-B</mat-option>
              <mat-option value="Etching-1">Etching-1</mat-option>
              <mat-option value="Deposition-1">Deposition-1</mat-option>
              <mat-option value="Packaging">Packaging</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Last Maintenance</mat-label>
              <input matInput type="datetime-local" [(ngModel)]="equipment.lastMaintenanceAt" name="lastMaintenanceAt">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Next Maintenance</mat-label>
              <input matInput type="datetime-local" [(ngModel)]="equipment.nextMaintenanceAt" name="nextMaintenanceAt">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput rows="3" [(ngModel)]="equipment.notes" name="notes"></textarea>
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
    mat-card { max-width: 760px; margin: 0 auto; padding: 24px; }
    .equipment-form { display: flex; flex-direction: column; gap: 4px; margin-top: 16px; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class EquipmentFormComponent implements OnInit {
  equipment: Partial<Equipment> = {
    name: '',
    code: '',
    type: 'machine',
    status: 'available',
    productionLine: '',
    notes: ''
  };
  isEdit = false;
  loading = false;
  private equipmentId: number | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.equipmentId = +id;
      this.equipmentService.getEquipment(this.equipmentId).subscribe({
        next: (item) => {
          this.equipment = {
            ...item,
            lastMaintenanceAt: this.toDatetimeLocalValue(item.lastMaintenanceAt),
            nextMaintenanceAt: this.toDatetimeLocalValue(item.nextMaintenanceAt),
          };
        },
        error: () => this.snackBar.open('Equipment not found', 'Close', { duration: 3000 })
      });
    }
  }

  onSubmit(): void {
    this.loading = true;
    const payload: Partial<Equipment> = {
      ...this.equipment,
      lastMaintenanceAt: this.equipment.lastMaintenanceAt || null,
      nextMaintenanceAt: this.equipment.nextMaintenanceAt || null,
      notes: this.equipment.notes || null,
    };

    const obs = this.isEdit && this.equipmentId
      ? this.equipmentService.updateEquipment(this.equipmentId, payload)
      : this.equipmentService.createEquipment(payload);

    obs.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Equipment updated' : 'Equipment created',
          'Close',
          { duration: 2000 }
        );
        this.router.navigate(['/equipment']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.error || err.error?.errors?.[0] || 'Operation failed';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/equipment']);
  }

  private toDatetimeLocalValue(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const tzOffsetMinutes = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - tzOffsetMinutes * 60000);
    return localDate.toISOString().slice(0, 16);
  }
}
