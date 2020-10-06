import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRequirementsPage } from './order-requirements.page';

describe('OrderRequirementsPage', () => {
  let component: OrderRequirementsPage;
  let fixture: ComponentFixture<OrderRequirementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderRequirementsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderRequirementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
