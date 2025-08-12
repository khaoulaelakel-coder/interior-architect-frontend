import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Education } from '../../../../education.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-education',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-education.component.html',
  styleUrl: './add-education.component.css'
})
export class AddEducationComponent implements OnInit {
  educationForm!: FormGroup;

  constructor(private fb: FormBuilder , private apiservice : ApiService , private router:Router) {}

  ngOnInit(): void {
    this.educationForm = this.fb.group
    ({
      year_start: ['', Validators.required],
      year_end: ['', Validators.required],
      diploma: ['', Validators.required],
      school: ['', Validators.required],
      user_id: []
    });


  }

  onSubmit(): void 
  {
   console.log('OnSubmit called');

   // Check if the form is valid
   if(!this.educationForm.valid)
   {
    console.error('Form is invalid');
    return;
   }

   // create a form data
   const data = this.educationForm.value;

  
    // Call the API service to add the education
    this.apiservice.addEducation(data).subscribe
    ({
      next:(res)=> 
      {
        console.log('Education added successfully:', res);

        //reset the form

        this.educationForm.reset();

         Swal.fire({
                title: "Education added successfully!",
                icon: "success",
                draggable: true
              });    

        this.router.navigate(['/admin/list/education']);
      },
      error: (err) => {
        console.error('Error adding education:', err);
        Swal.fire({
          title: 'Error adding education',
          text: err.message || 'Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
    );
  }
  }