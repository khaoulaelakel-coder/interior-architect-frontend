import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryProjectsComponent } from './category-projects.component';

describe('CategoryProjectsComponent', () => {
  let component: CategoryProjectsComponent;
  let fixture: ComponentFixture<CategoryProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryProjectsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
