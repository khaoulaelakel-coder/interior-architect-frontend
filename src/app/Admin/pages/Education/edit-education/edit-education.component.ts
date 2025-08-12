import { Education } from './../../../../model/education.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-education.component.html',
  styleUrl: './edit-education.component.css'
})
export class EditEducationComponent implements OnInit {
  educationForm!:FormGroup;
  educationId!: number;

  constructor
  (
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api : ApiService,
    private router: Router
  ) {}

  ngOnInit(): void
  {
    this.educationForm = this.fb.group
    ({
      year_start:['' , Validators.required],
      year_end:['' , Validators.required],
      diploma:['' , Validators.required],
      school:['' , Validators.required],
    }) ;

    // Get the education ID from the route parameters
    this.educationId= Number(this.route.snapshot.paramMap.get('id'));

    // load the education data

     this.api.geteducationById(this.educationId).subscribe
     ({
      next:(res:any)=>
      {
          console.log('RAW RESPONSE:', res);

        const edu = res.education;
        this.educationForm.patchValue({
          year_start: edu.year_start?.substring(0, 10), // Format the date to YYYY-MM-DD
          year_end: edu.year_end?.substring(0, 10),
          diploma: edu.diploma,
          school: edu.school
        });
      },
      error:(err)=>
      {
        console.error('Error fetching education data:', err);
      }
     });
  }

  onSubmit():void
  {
    if(this.educationForm.invalid)
    {
      console.error('Form is invalid');
      return;
    }

    this.api.updateEducation(this.educationId, this.educationForm.value).subscribe
    ({
      next:(res)=>
      {
        console.log('Education updated successfully:', res);
        Swal.fire({
          title: "Education updated successfully!",
          icon: "success",
          draggable: true
        });
        this.router.navigate(['/admin/list/education']);
      },
      error:(err)=>
      {
        console.error('Error updating education:', err);
        Swal.fire({
          title: 'Error updating education',
          text: 'Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  
  }
}
