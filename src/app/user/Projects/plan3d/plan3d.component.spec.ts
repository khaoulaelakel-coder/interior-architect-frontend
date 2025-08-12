import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plan3dComponent } from './plan3d.component';

describe('Plan3dComponent', () => {
  let component: Plan3dComponent;
  let fixture: ComponentFixture<Plan3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plan3dComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Plan3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
