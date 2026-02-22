import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timer } from 'rxjs';
import { environment } from '../../environments/environment';

export type EquipmentType = 'machine' | 'robot' | 'conveyor' | 'sensor' | 'tooling';
export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'offline';

export interface Equipment {
  id?: number;
  name: string;
  code: string;
  type: EquipmentType;
  status: EquipmentStatus;
  productionLine: string;
  lastMaintenanceAt?: string | null;
  nextMaintenanceAt?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentFilters {
  status?: string;
  type?: string;
  productionLine?: string;
}

export interface EquipmentStatistics {
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
  byProductionLine: { production_line: string; count: number }[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipmentList(filters?: EquipmentFilters): Observable<Equipment[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.productionLine) params = params.set('productionLine', filters.productionLine);
    return this.http.get<Equipment[]>(this.apiUrl, { params }).pipe(
      retry({ count: 2, delay: () => timer(1500) })
    );
  }

  getEquipment(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
  }

  createEquipment(equipment: Partial<Equipment>): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, equipment);
  }

  updateEquipment(id: number, equipment: Partial<Equipment>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, equipment);
  }

  deleteEquipment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getStatistics(): Observable<EquipmentStatistics> {
    return this.http.get<EquipmentStatistics>(`${this.apiUrl}/statistics`);
  }
}
