import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
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
