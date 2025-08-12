import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Experience } from '../../../../model/experience.model';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-experience',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-experience.component.html',
  styleUrl: './add-experience.component.css'
})
export class AddExperienceComponent implements OnInit {
  experienceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.experienceForm = this.fb.group({
      year_start: ['', Validators.required],
      year_end: [],
      poste: ['', Validators.required],
      place: ['', Validators.required],
      city: ['', Validators.required],
      user_id: [],  
      currently_working: [false],
    });

    this.experienceForm.get('currently_working')?.valueChanges.subscribe(checked => {
      const endDateControl = this.experienceForm.get('year_end');
      if (checked) {
        endDateControl?.disable();
        endDateControl?.setValue(null);
      } else {
        endDateControl?.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.experienceForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const data = this.experienceForm.value;

    // Optional: Set user_id here if needed
    // data.user_id = yourUserId;

    this.api.addExperience(data).subscribe({
      next: (res) => {
        console.log('Experience added successfully:', res);

        this.experienceForm.reset();

        Swal.fire({
          title: "Experience added successfully!",
          icon: "success",
          draggable: true
        });

        this.router.navigate(['admin', 'list', 'experience']);
      },
      error: (err) => {
        console.error('Error adding experience:', err);
        Swal.fire({
          title: "Error adding experience!",
          text: err.message || 'Please try again later.',
          icon: "error",
          draggable: true
        });
      }
    });
  }
}
