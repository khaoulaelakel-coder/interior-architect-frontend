import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RacentprojectsComponent } from './racentprojects.component';

describe('RacentprojectsComponent', () => {
  let component: RacentprojectsComponent;
  let fixture: ComponentFixture<RacentprojectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RacentprojectsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RacentprojectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
