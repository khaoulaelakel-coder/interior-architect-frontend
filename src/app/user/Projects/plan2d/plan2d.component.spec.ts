import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plan2dComponent } from './plan2d.component';

describe('Plan2dComponent', () => {
  let component: Plan2dComponent;
  let fixture: ComponentFixture<Plan2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plan2dComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Plan2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
