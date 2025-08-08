import { Component , AfterViewInit , OnInit } from '@angular/core';
import { CountUp } from 'countup.js';
import * as AOS from 'aos';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements AfterViewInit , OnInit {


  
  
  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: false, 
      mirror: true,
      easing: 'ease-in-out',
      delay: 100
    });
  }

  ngAfterViewInit(): void {
   setTimeout(() => {
  const counterYears = new CountUp('experienceCounter', 2, {
    startVal: 1,
    duration: 2
  });

  if (!counterYears.error) {
    counterYears.start(); // This makes it go from 1 → 2
  } else {
    console.error(counterYears.error);
  }
}, 500);

      const counterProject = new CountUp('projectCounter' , 100, 
        {
          startVal:0,
          duration:2.5
        });

        const counterClient = new CountUp('clientCounter', 100, {
          startVal: 0,
          duration: 2.2
        });


        if(!counterYears.error && !counterProject.error && !counterClient.error)
        {
          counterClient.start();
          counterProject.start();
          counterClient.start();
        }else{
          console.error('Error with counters:', 
            counterYears.error, 
            counterProject.error, 
            counterClient.error
          );
        }
    },300);

    setTimeout(() => {
      AOS.refreshHard(); 
    }, 500);
  }
 
  
}
