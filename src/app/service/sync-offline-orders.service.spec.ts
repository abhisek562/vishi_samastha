import { TestBed } from '@angular/core/testing';

import { SyncOfflineOrdersService } from './sync-offline-orders.service';

describe('SyncOfflineOrdersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SyncOfflineOrdersService = TestBed.get(SyncOfflineOrdersService);
    expect(service).toBeTruthy();
  });
});
