import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EquipmentService } from './equipment.service';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EquipmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(EquipmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests equipment list without filters', () => {
    service.getEquipmentList().subscribe((items) => {
      expect(items).toEqual([]);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/equipment');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('requests equipment list with query filters', () => {
    service.getEquipmentList({ status: 'maintenance', type: 'robot' }).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === 'http://localhost:8000/api/equipment' &&
        request.params.get('status') === 'maintenance' &&
        request.params.get('type') === 'robot'
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
