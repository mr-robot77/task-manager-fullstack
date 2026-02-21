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
import { Equipment, EquipmentFilters, EquipmentService } from '../../services/equipment.service';

const DEMO_EQUIPMENT: Equipment[] = [
  { id: 1, name: 'Wafer Handler Robot #1', code: 'WH-ROB-001', type: 'robot', status: 'in_use', productionLine: 'Line A' },
  { id: 2, name: 'Lithography Stepper', code: 'LITH-STEP-01', type: 'machine', status: 'in_use', productionLine: 'Line A' },
  { id: 3, name: 'Conveyor Belt A', code: 'CONV-A-01', type: 'conveyor', status: 'available', productionLine: 'Line A' },
  { id: 4, name: 'Temperature Sensor Bank', code: 'TEMP-SNS-01', type: 'sensor', status: 'available', productionLine: 'Line B' },
  { id: 5, name: 'Etching Tool Set', code: 'ETCH-TL-001', type: 'tooling', status: 'maintenance', productionLine: 'Line B' },
  { id: 6, name: 'Inspection Robot', code: 'INSP-ROB-01', type: 'robot', status: 'available', productionLine: 'Line C' },
  { id: 7, name: 'Deposition Chamber', code: 'DEP-CH-01', type: 'machine', status: 'offline', productionLine: 'Line C' },
];

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatSelectModule,
    MatIconModule, MatFormFieldModule, MatSnackBarModule
  ],
  template: `
    <div class="header">
      <h1>Equipment Management</h1>
      <a mat-raised-button color="primary" routerLink="/equipment/new">
        <mat-icon>add</mat-icon> New Equipment
      </a>
    </div>

    <div class="filters">
      <mat-form-field>
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="filters.status" (selectionChange)="loadEquipment()">
          <mat-option value="">All</mat-option>
          <mat-option value="available">Available</mat-option>
          <mat-option value="in_use">In Use</mat-option>
          <mat-option value="maintenance">Maintenance</mat-option>
          <mat-option value="offline">Offline</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="filters.type" (selectionChange)="loadEquipment()">
          <mat-option value="">All</mat-option>
          <mat-option value="machine">Machine</mat-option>
          <mat-option value="robot">Robot</mat-option>
          <mat-option value="conveyor">Conveyor</mat-option>
          <mat-option value="sensor">Sensor</mat-option>
          <mat-option value="tooling">Tooling</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <table mat-table [dataSource]="equipment" class="mat-elevation-z4 full-width">
      <ng-container matColumnDef="code">
        <th mat-header-cell *matHeaderCellDef>Code</th>
        <td mat-cell *matCellDef="let item">{{ item.code }}</td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let item">{{ item.name }}</td>
      </ng-container>

      <ng-container matColumnDef="type">
        <th mat-header-cell *matHeaderCellDef>Type</th>
        <td mat-cell *matCellDef="let item">{{ item.type }}</td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let item">
          <span class="chip" [class]="'status-' + item.status">{{ item.status }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="productionLine">
        <th mat-header-cell *matHeaderCellDef>Line</th>
        <td mat-cell *matCellDef="let item">{{ item.productionLine }}</td>
      </ng-container>

      <ng-container matColumnDef="nextMaintenanceAt">
        <th mat-header-cell *matHeaderCellDef>Next Maintenance</th>
        <td mat-cell *matCellDef="let item">
          {{ item.nextMaintenanceAt ? (item.nextMaintenanceAt | date:'yyyy-MM-dd HH:mm') : '-' }}
        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let item">
          <a mat-icon-button [routerLink]="['/equipment', item.id, 'edit']">
            <mat-icon>edit</mat-icon>
          </a>
          <button mat-icon-button color="warn" (click)="deleteEquipment(item.id!)">
            <mat-icon>delete</mat-icon>
          </button>
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
    .status-available { background: #e8f5e9; color: #2e7d32; }
    .status-in_use { background: #e3f2fd; color: #1565c0; }
    .status-maintenance { background: #fff3e0; color: #e65100; }
    .status-offline { background: #ffebee; color: #c62828; }
  `]
})
export class EquipmentListComponent implements OnInit {
  equipment: Equipment[] = [];
  filters: EquipmentFilters = {};
  displayedColumns = ['code', 'name', 'type', 'status', 'productionLine', 'nextMaintenanceAt', 'actions'];

  constructor(private equipmentService: EquipmentService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.equipmentService.getEquipmentList(this.filters).subscribe({
      next: (items) => this.equipment = items?.length ? items : DEMO_EQUIPMENT,
      error: () => {
        this.equipment = DEMO_EQUIPMENT;
        this.snackBar.open('Showing demo data (backend unavailable)', 'Close', { duration: 3000 });
      },
    });
  }

  deleteEquipment(id: number): void {
    if (confirm('Are you sure you want to delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe({
        next: () => {
          this.snackBar.open('Equipment deleted', 'Close', { duration: 2000 });
          this.loadEquipment();
        },
        error: () => this.snackBar.open('Failed to delete equipment', 'Close', { duration: 3000 })
      });
    }
  }
}
