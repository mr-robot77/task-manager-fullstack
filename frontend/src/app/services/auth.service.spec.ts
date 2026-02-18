import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // #region agent log
    fetch('http://127.0.0.1:7609/ingest/e8709f53-640d-40fa-9064-c7258dc3c672',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fd26b'},body:JSON.stringify({sessionId:'3fd26b',runId:'coverage-pre',hypothesisId:'H1',location:'frontend/src/app/services/auth.service.spec.ts:12',message:'AuthService test beforeEach executed',data:{hasFetch:typeof fetch === 'function'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('stores token after login', () => {
    // #region agent log
    fetch('http://127.0.0.1:7609/ingest/e8709f53-640d-40fa-9064-c7258dc3c672',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3fd26b'},body:JSON.stringify({sessionId:'3fd26b',runId:'coverage-pre',hypothesisId:'H3',location:'frontend/src/app/services/auth.service.spec.ts:34',message:'AuthService login test running',data:{targetUrl:'http://localhost:8000/api/login_check'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    service.login('user@example.com', 'secret').subscribe((response) => {
      expect(response.token).toBe('jwt-token');
      expect(service.getToken()).toBe('jwt-token');
    });

    const req = httpMock.expectOne('http://localhost:8000/api/login_check');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt-token' });
  });

  it('clears token on logout', () => {
    localStorage.setItem('jwt_token', 'jwt-token');

    service.logout();

    expect(service.getToken()).toBeNull();
  });
});
