import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  productionLine: string;
  assignedTo?: {
    id: number;
    email: string;
    fullName: string;
  };
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  productionLine?: string;
}

export interface TaskStatistics {
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byProductionLine: { production_line: string; count: number }[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.priority) params = params.set('priority', filters.priority);
    if (filters?.productionLine) params = params.set('productionLine', filters.productionLine);
    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: Partial<Task>): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getStatistics(): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(`${this.apiUrl}/statistics`);
  }
}
