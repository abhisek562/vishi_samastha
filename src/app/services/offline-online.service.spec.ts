import { TestBed } from '@angular/core/testing';

import { OfflineOnlineService } from './offline-online.service';

describe('OfflineOnlineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OfflineOnlineService = TestBed.get(OfflineOnlineService);
    expect(service).toBeTruthy();
  });
});
