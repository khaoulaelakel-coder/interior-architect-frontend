import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

// Admin Components
import { DashComponent } from './pages/dash/dash.component';
import { AddEducationComponent } from './pages/Education/add-education/add-education.component';
import { ListEducationComponent } from './pages/Education/list-education/list-education.component';
import { EditEducationComponent } from './pages/Education/edit-education/edit-education.component';
import { AddExperienceComponent } from './pages/EE/add-experience/add-experience.component';
import { AllExperiencesComponent } from './pages/EE/all-experiences/all-experiences.component';
import { UpdateExperienceComponent } from './pages/EE/update-experience/update-experience.component';
import { AddProjectComponent } from './pages/project/add-project/add-project.component';
import { AllProjectsComponent } from './pages/project/all-projects/all-projects.component';
import { UpdateProjectComponent } from './pages/project/update-project/update-project.component';
import { CreateSkillsComponent } from './pages/skils/create-skills/create-skills.component';
import { AllSkillsComponent } from './pages/skils/all-skills/all-skills.component';
import { UpdateSkillsComponent } from './pages/skils/update-skills/update-skills.component';
import { CreateCategoryComponent } from './pages/category_project/create-category/create-category.component';
import { AllCategoryComponent } from './pages/category_project/all-category/all-category.component';
import { EditCategoryComponent } from './pages/category_project/edit-category/edit-category.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AllCvsComponent } from './pages/cv/all-cvs/all-cvs.component';
import { AddCvComponent } from './pages/cv/add-cv/add-cv.component';
import { UpdateCvComponent } from './pages/cv/update-cv/update-cv.component';

export const adminRoutes: Routes = [
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
];
