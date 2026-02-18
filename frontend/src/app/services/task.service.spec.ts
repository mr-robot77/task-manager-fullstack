import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests tasks without filters', () => {
    service.getTasks().subscribe((tasks) => {
      expect(tasks).toEqual([]);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('requests tasks with query filters', () => {
    service.getTasks({ status: 'todo', priority: 'high' }).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === 'http://localhost:8000/api/tasks' &&
        request.params.get('status') === 'todo' &&
        request.params.get('priority') === 'high'
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
