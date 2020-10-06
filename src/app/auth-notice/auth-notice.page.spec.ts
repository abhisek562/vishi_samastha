import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthNoticePage } from './auth-notice.page';

describe('AuthNoticePage', () => {
  let component: AuthNoticePage;
  let fixture: ComponentFixture<AuthNoticePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthNoticePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthNoticePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
