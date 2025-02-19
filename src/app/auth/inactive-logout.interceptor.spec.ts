import { TestBed } from '@angular/core/testing';

import { InactiveLogoutInterceptor } from './inactive-logout.interceptor';

describe('InactiveLogoutInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      InactiveLogoutInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: InactiveLogoutInterceptor = TestBed.inject(InactiveLogoutInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
