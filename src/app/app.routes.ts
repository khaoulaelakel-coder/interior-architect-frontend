import { EditEducationComponent } from './Admin/pages/Education/edit-education/edit-education.component';
import { Routes } from '@angular/router';
import { clientLayoutComponent } from './layouts/client-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout.component';
import { adminGuard } from './Admin/guards/admin.guard';
import { ProjectsComponent } from './user/pages/projects/projects.component';
import { HomeComponent } from './user/pages/home/home.component';
import { Plan3dComponent } from './user/Projects/plan3d/plan3d.component';
import { Plan2dComponent } from './user/Projects/plan2d/plan2d.component';
import { FloorplanComponent } from './user/Projects/floorplan/floorplan.component';

import { AddEducationComponent } from './Admin/pages/Education/add-education/add-education.component';
import { ListEducationComponent } from './Admin/pages/Education/list-education/list-education.component';
import { AddExperienceComponent } from './Admin/pages/EE/add-experience/add-experience.component';
import { AllExperiencesComponent } from './Admin/pages/EE/all-experiences/all-experiences.component';
import { DashComponent } from './Admin/pages/dash/dash.component';
import { AddProjectComponent } from './Admin/pages/project/add-project/add-project.component';
import { AllProjectsComponent } from './Admin/pages/project/all-projects/all-projects.component';
import { ContactComponent } from './Admin/pages/contact/contact.component';
import { ContactListComponent } from './Admin/pages/contact-list/contact-list.component';
import { CreateSkillsComponent } from './Admin/pages/skils/create-skills/create-skills.component';
import { AllSkillsComponent } from './Admin/pages/skils/all-skills/all-skills.component';
import { CreateCategoryComponent } from './Admin/pages/category_project/create-category/create-category.component';
import { AllCategoryComponent } from './Admin/pages/category_project/all-category/all-category.component';
import { UpdateProjectComponent } from './Admin/pages/project/update-project/update-project.component';
import { LoginComponent } from './login/login.component';

import { UpdateExperienceComponent } from './Admin/pages/EE/update-experience/update-experience.component';
import { EditCategoryComponent } from './Admin/pages/category_project/edit-category/edit-category.component';
import { UpdateSkillsComponent } from './Admin/pages/skils/update-skills/update-skills.component';
import { PortfolioComponent } from './user/pages/projects/portfolio/portfolio.component';
import { CategoryProjectsComponent } from './user/pages/projects/category-projects/category-projects.component';
import { ProjectDetailsComponent } from './user/pages/project-details/project-details.component';
import { AllCvsComponent } from './Admin/pages/cv/all-cvs/all-cvs.component';
import { AddCvComponent } from './Admin/pages/cv/add-cv/add-cv.component';
import { UpdateCvComponent } from './Admin/pages/cv/update-cv/update-cv.component';

export const routes: Routes = [
  {
    path: '',
    component: clientLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'categories/:id', component: CategoryProjectsComponent },
      { path: 'project-details/:id', component: ProjectDetailsComponent },
      { path: 'projects/3D', component: Plan3dComponent },
      { path: 'projects/2D', component: Plan2dComponent },
      { path: 'projects/floorPlan', component: FloorplanComponent },
    ],
  },
  {
    path: 'admin/login',
    component: LoginComponent
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'add/education',
        component: AddEducationComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'list/education',
        component: ListEducationComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'edit/education/:id',
        component: EditEducationComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'add/experience',
        component: AddExperienceComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'list/experience',
        component: AllExperiencesComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'edit/experience/:id',
        component: UpdateExperienceComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'add/project',
        component: AddProjectComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'list/project',
        component: AllProjectsComponent,
        canActivate: [adminGuard]
      },

      {
        path: 'edit/project/:id',
        component: UpdateProjectComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'add/skills',
        component: CreateSkillsComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'list/skills',
        component: AllSkillsComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'add/categories',
        component: CreateCategoryComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'edit/skill/:id',
        component: UpdateSkillsComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'list/categories',
        component: AllCategoryComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'edit/categories/:id',
        component: EditCategoryComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'contact',
        component: ContactComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'contact-list',
        component: ContactListComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'list/cvs',
        component: AllCvsComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'add/cv',
        component: AddCvComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'edit/cv/:id',
        component: UpdateCvComponent,
        canActivate: [adminGuard]
      },

      // Redirect empty admin path to dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ],
  },

  // Fallback route
  { path: '**', redirectTo: '' }
];