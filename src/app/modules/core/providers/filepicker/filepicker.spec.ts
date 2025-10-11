import { TestBed } from '@angular/core/testing';

import { Filepicker } from './filepicker';

describe('Filepicker', () => {
  let service: Filepicker;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Filepicker);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
