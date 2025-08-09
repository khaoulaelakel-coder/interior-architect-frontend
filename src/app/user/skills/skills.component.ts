import { Component, OnInit, signal, Signal } from '@angular/core';
import { Skill } from '../../model/skills.model';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent implements OnInit {
  skills = signal<Skill[]>([]); // 🟢 Signal that holds all skills

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadSkills();
  }

  loadSkills(): void {
    this.api.getSkills().subscribe((res: any) => {
      this.skills.set(res.skills || []);
    });
  }

  getImageUrl(logoData: string): string {
    // Skills now come with base64 data directly from the API
    return logoData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }
}
