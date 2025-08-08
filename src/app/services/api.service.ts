import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryResponse } from '../model/category.model'; // Adjust the import path as necessary
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }  // Inject HttpClient here

  getProjects(): Observable<any> {
    //This method calls the API to get all projects
    return this.http.get(`${this.apiUrl}/projects`);
  }

  getProjectById(projectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}`);
  }

  addProjects(fromData: FormData) {

    return this.http.post(`${this.apiUrl}/projects`, fromData);
  }

  deleteProject(projectId: number): Observable<any> {
    // This method calls the API to delete a project by its ID
    return this.http.delete(`${this.apiUrl}/projects/${projectId}`);
  }

  updateProject(projectId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/projects/${projectId}`, formData);
  }

  getCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/category`);
  }

  getProjectsByCategory(categoryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${categoryId}/projects`);
  }

  getEducations() {
    // This method calls the API to get all educations
    return this.http.get(`${this.apiUrl}/education`);
  }

  geteducationById(id: number) {
    // This method calls the API to get a specific education by its ID
    return this.http.get(`${this.apiUrl}/education/${id}`);
  }

  addEducation(data: any) {
    return this.http.post(`${this.apiUrl}/education`, data);
  }

  updateEducation(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/education/${id}`, data);
  }
  deleteEducation(id: number) {
    return this.http.delete(`${this.apiUrl}/education/${id}`);
  }


  getExperiences() {
    return this.http.get(`${this.apiUrl}/experience`)
  }

  getExperienceById(id: number) {
    return this.http.get(`${this.apiUrl}/experience/${id}`);
  }

  addExperience(data: any) {
    return this.http.post(`${this.apiUrl}/experience`, data);
  }

  updateExperience(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/experience/${id}`, data);
  }

  deleteExperience(id: number) {
    return this.http.delete(`${this.apiUrl}/experience/${id}`);
  }

  getcategory() {
    return this.http.get(`${this.apiUrl}/category`);
  }

  getCategoryById(id: number) {
    return this.http.get(`${this.apiUrl}/category/${id}`);
  }

  addcategories(data: FormData) {
    return this.http.post(`${this.apiUrl}/category`, data);
  }
  updateCategory(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/category/${id}`, data);
  }

  deletecategories(id: number) {
    return this.http.delete(`${this.apiUrl}/category/${id}`);
  }

  addskills(data: FormData) {
    return this.http.post(`${this.apiUrl}/skills`, data);
  }
  getSkills(): Observable<any> {
    return this.http.get(`${this.apiUrl}/skills`);
  }
  deleteSkill(id: number) {
    return this.http.delete(`${this.apiUrl}/skills/${id}`);
  }

  getSkillById(id: number) {
    // This method calls the API to get a specific skill by its ID
    return this.http.get(`${this.apiUrl}/skills/${id}`);
  }

  uptdateSkill(id: number, data: any) {
    return this.http.post(`${this.apiUrl}/skills/${id}`, data);
  }
  getContacts() {
    return this.http.get<any[]>(`${this.apiUrl}/admin/contacts`);
  }

  /*addProjects(fromData : FormData)
  {
    const token = localStorage.getItem('auth_token');
    const headers= token?
    new HttpHeaders
    ({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'

    }): undefined;
    return this.http.post(`${this.apiUrl}/projects`, fromData, { headers });
  }
*/

}
