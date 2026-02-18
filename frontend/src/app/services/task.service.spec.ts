import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // #region agent log
    fetch('http://127.0.0.1:7609/ingest/e8709f53-640d-40fa-9064-c7258dc3c672',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fd26b'},body:JSON.stringify({sessionId:'3fd26b',runId:'coverage-pre',hypothesisId:'H1',location:'frontend/src/app/services/task.service.spec.ts:12',message:'TaskService test beforeEach executed',data:{hasFetch:typeof fetch === 'function'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7609/ingest/e8709f53-640d-40fa-9064-c7258dc3c672',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fd26b'},body:JSON.stringify({sessionId:'3fd26b',runId:'coverage-pre',hypothesisId:'H3',location:'frontend/src/app/services/task.service.spec.ts:44',message:'TaskService filtered request test running',data:{filters:{status:'todo',priority:'high'}},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

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
