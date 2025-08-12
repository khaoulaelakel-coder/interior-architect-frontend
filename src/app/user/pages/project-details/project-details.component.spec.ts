import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProjectDetailsComponent } from './project-details.component';
import { ApiService } from '../../../services/api.service';
import { ChangeDetectorRef } from '@angular/core';

describe('ProjectDetailsComponent', () => {
  let component: ProjectDetailsComponent;
  let fixture: ComponentFixture<ProjectDetailsComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockProject = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    category: { name: 'Test Category' },
    images: [
      { id: 1, image_url: 'data:image/png;base64,test1' },
      { id: 2, image_url: 'data:image/png;base64,test2' }
    ]
  };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getProjectById']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDetailsComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project on init', () => {
    mockApiService.getProjectById.and.returnValue(of({ project: mockProject }));

    component.ngOnInit();

    expect(mockApiService.getProjectById).toHaveBeenCalledWith(1);
    expect(component.project).toEqual(mockProject);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading project', () => {
    const error = { status: 404 };
    mockApiService.getProjectById.and.returnValue(of().pipe(() => { throw error; }));

    component.ngOnInit();

    expect(component.error).toBe('Projet introuvable');
    expect(component.loading).toBeFalse();
  });

  it('should navigate to next image', () => {
    component.project = mockProject;
    component.currentImageIndex = 0;

    component.nextImage();

    expect(component.currentImageIndex).toBe(1);
  });

  it('should navigate to previous image', () => {
    component.project = mockProject;
    component.currentImageIndex = 1;

    component.previousImage();

    expect(component.currentImageIndex).toBe(0);
  });

  it('should wrap around when navigating past last image', () => {
    component.project = mockProject;
    component.currentImageIndex = 1;

    component.nextImage();

    expect(component.currentImageIndex).toBe(0);
  });

  it('should wrap around when navigating before first image', () => {
    component.project = mockProject;
    component.currentImageIndex = 0;

    component.previousImage();

    expect(component.currentImageIndex).toBe(1);
  });

  it('should open modal', () => {
    component.project = mockProject;

    component.openModal(1);

    expect(component.isModalOpen).toBeTrue();
    expect(component.modalImageIndex).toBe(1);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should close modal', () => {
    component.isModalOpen = true;
    document.body.style.overflow = 'hidden';

    component.closeModal();

    expect(component.isModalOpen).toBeFalse();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should get project ID from route', () => {
    const projectId = component.getProjectId();
    expect(projectId).toBe('1');
  });

  it('should get image count', () => {
    component.project = mockProject;
    const count = component.getImageCount();
    expect(count).toBe(2);
  });

  it('should check if has multiple images', () => {
    component.project = mockProject;
    const hasMultiple = component.hasMultipleImages();
    expect(hasMultiple).toBeTrue();
  });

  it('should get current image info', () => {
    component.project = mockProject;
    component.currentImageIndex = 1;

    const info = component.getCurrentImageInfo();

    expect(info.index).toBe(2);
    expect(info.total).toBe(2);
  });

  it('should handle image error', () => {
    const event = { target: { src: 'invalid-image.jpg' } } as any;

    component.onImageError(event);

    expect(event.target.src).toBe('assets/Image/user.png');
  });

  it('should get image URL', () => {
    const url = component.getImageUrl('data:image/png;base64,test');
    expect(url).toBe('data:image/png;base64,test');
  });

  it('should get fallback image URL', () => {
    const url = component.getImageUrl('');
    expect(url).toBe('assets/Image/user.png');
  });

  it('should go to specific image', () => {
    component.project = mockProject;

    component.goToImage(1);

    expect(component.currentImageIndex).toBe(1);
  });

  it('should not go to invalid image index', () => {
    component.project = mockProject;
    component.currentImageIndex = 0;

    component.goToImage(5);

    expect(component.currentImageIndex).toBe(0);
  });

  it('should navigate modal images', () => {
    component.project = mockProject;
    component.modalImageIndex = 0;

    component.nextModalImage();
    expect(component.modalImageIndex).toBe(1);

    component.previousModalImage();
    expect(component.modalImageIndex).toBe(0);
  });

  it('should go to modal image', () => {
    component.project = mockProject;

    component.goToModalImage(1);

    expect(component.modalImageIndex).toBe(1);
  });

  it('should handle backdrop click', () => {
    component.isModalOpen = true;
    const event = { target: document.createElement('div'), currentTarget: document.createElement('div') };

    // Simulate backdrop click
    Object.defineProperty(event, 'target', { value: event.currentTarget });

    component.onModalBackdropClick(event as any);

    expect(component.isModalOpen).toBeFalse();
  });

  it('should not close modal on content click', () => {
    component.isModalOpen = true;
    const event = { target: document.createElement('div'), currentTarget: document.createElement('div') };

    component.onModalBackdropClick(event as any);

    expect(component.isModalOpen).toBeTrue();
  });

  it('should clean up on destroy', () => {
    component.isModalOpen = true;
    document.body.style.overflow = 'hidden';

    component.ngOnDestroy();

    expect(component.isModalOpen).toBeFalse();
    expect(document.body.style.overflow).toBe('auto');
  });
});
