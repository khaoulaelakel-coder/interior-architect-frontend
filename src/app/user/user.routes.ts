import { Routes } from '@angular/router';

// User Components
import { HomeComponent } from './pages/home/home.component';
import { PortfolioComponent } from './pages/projects/portfolio/portfolio.component';
import { CategoryProjectsComponent } from './pages/projects/category-projects/category-projects.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { Plan3dComponent } from '../user/Projects/plan3d/plan3d.component';
import { Plan2dComponent } from '../user/Projects/plan2d/plan2d.component';
import { FloorplanComponent } from '../user/Projects/floorplan/floorplan.component';

export const userRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'portfolio', component: PortfolioComponent },
    { path: 'categories/:id', component: CategoryProjectsComponent },
    { path: 'project-details/:id', component: ProjectDetailsComponent },
    { path: 'projects/3D', component: Plan3dComponent },
    { path: 'projects/2D', component: Plan2dComponent },
    { path: 'projects/floorPlan', component: FloorplanComponent },
];
