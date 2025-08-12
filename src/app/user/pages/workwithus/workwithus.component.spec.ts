import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkwithusComponent } from './workwithus.component';

describe('WorkwithusComponent', () => {
  let component: WorkwithusComponent;
  let fixture: ComponentFixture<WorkwithusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkwithusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkwithusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
