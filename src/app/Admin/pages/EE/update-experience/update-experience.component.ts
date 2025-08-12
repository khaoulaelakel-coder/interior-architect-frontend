import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-experience',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './update-experience.component.html',
  styleUrl: './update-experience.component.css'
})
export class UpdateExperienceComponent implements OnInit{
experienceForm!: FormGroup;
experienceId!: number;

constructor
(
  private route: ActivatedRoute,
  private fb: FormBuilder,
  private api: ApiService,
  private router: Router
  
){}

ngOnInit():void
{
this.experienceForm=this.fb.group
({
  year_start:['' , Validators.required],
  year_end:['' ],
  poste:['' , Validators.required],
  place:['' , Validators.required],
  city:['' , Validators.required],
  user_id:[],  // assign if you want
  currently_working: [false],
});
// Get the experience ID from the route parameters
this.experienceId=Number(this.route.snapshot.paramMap.get('id'));
// load the experience data
this.api.getExperienceById(this.experienceId).subscribe
({
  next:(res:any)=>
  {
    console.log('RAW RESPONSE:', res);

    const item = res.experience;
    this.experienceForm.patchValue
    ({
      year_start: item.year_start?.substring(0, 10), // Format the date to YYYY-MM-DD
      year_end: item.year_end?.substring(0, 10),
      poste: item.poste,
      place: item.place,
      city: item.city,
      user_id: item.user_id,
      currently_working: item.currently_working
    })
  }
});
}

onSubmit()
{
  if(this.experienceForm.invalid)
  {
    console.log('Form is invalid');
    return;
  }
  this.api.updateExperience(this.experienceId, this.experienceForm.value).subscribe
  ({
    next:(res:any)=>
    {
      console.log('Experience updated successfully:', res);
      
      Swal.fire({
        title: "Experience updated successfully!",
        icon: "success",
        draggable: true
      });
      this.experienceForm.reset();
      this.router.navigate(['admin', 'list', 'experience']);
    },
    error:(err:any)=>
    {
      console.error('Error updating experience:', err);
      Swal.fire({
        title: 'Error updating experience',
        text: err.message || 'Please try again later.',
        icon: "error",
        draggable: true
      });
    }
  });
}
}
