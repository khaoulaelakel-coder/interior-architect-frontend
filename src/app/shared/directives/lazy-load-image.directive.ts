import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ImageOptimizationService } from '../../services/image-optimization.service';

@Directive({
    selector: '[appLazyLoadImage]',
    standalone: true
})
export class LazyLoadImageDirective implements OnInit, OnDestroy {
    @Input() appLazyLoadImage: string = '';
    @Input() placeholder: string = '';
    @Input() errorPlaceholder: string = '';
    @Input() loadingClass: string = 'opacity-50';
    @Input() loadedClass: string = 'opacity-100';
    @Input() errorClass: string = 'opacity-75';

    private observer: IntersectionObserver | null = null;
    private imgElement: HTMLImageElement | null = null;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private imageService: ImageOptimizationService
    ) { }

    ngOnInit(): void {
        this.setupLazyLoading();
    }

    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private setupLazyLoading(): void {
        // Set initial placeholder
        this.setPlaceholder();

        // Create intersection observer for lazy loading
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage();
                        this.observer?.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px 0px', // Start loading 50px before image comes into view
                threshold: 0.1
            }
        );

        // Start observing the element
        this.observer.observe(this.el.nativeElement);
    }

    private setPlaceholder(): void {
        const element = this.el.nativeElement;

        if (element.tagName === 'IMG') {
            this.imgElement = element;
            this.renderer.setAttribute(element, 'src', this.placeholder || this.imageService.getLoadingPlaceholder());
            this.renderer.addClass(element, this.loadingClass);
        } else {
            // If it's not an img element, create one
            this.imgElement = this.renderer.createElement('img');
            this.renderer.setAttribute(this.imgElement, 'src', this.placeholder || this.imageService.getLoadingPlaceholder());
            this.renderer.addClass(this.imgElement, this.loadingClass);
            this.renderer.appendChild(element, this.imgElement);
        }
    }

    private loadImage(): void {
        if (!this.imgElement || !this.appLazyLoadImage) return;

        // Add loading state
        this.renderer.addClass(this.imgElement, this.loadingClass);
        this.renderer.removeClass(this.imgElement, this.loadedClass);

        // Create a new image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            if (this.imgElement) {
                this.renderer.setAttribute(this.imgElement, 'src', this.appLazyLoadImage);
                this.renderer.removeClass(this.imgElement, this.loadingClass);
                this.renderer.addClass(this.imgElement, this.loadedClass);

                // Add transition effect
                this.renderer.addClass(this.imgElement, 'transition-opacity duration-300');
            }
        };

        tempImg.onerror = () => {
            if (this.imgElement) {
                this.renderer.setAttribute(
                    this.imgElement,
                    'src',
                    this.errorPlaceholder || this.imageService.getErrorPlaceholder()
                );
                this.renderer.removeClass(this.imgElement, this.loadingClass);
                this.renderer.addClass(this.imgElement, this.errorClass);
            }
        };

        // Start loading the actual image
        tempImg.src = this.appLazyLoadImage;
    }
}
