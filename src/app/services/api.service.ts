import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryResponse } from '../model/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ==================== Projects ====================
  getProjects(page: number = 1, perPage?: number) {
    let url = `${this.apiUrl}/projects?page=${page}`;
    if (perPage) {
      url += `&per_page=${perPage}`;
    }
    return this.http.get(url);
  }

  // Get only recent projects (optimized for performance)
  getRecentProjects(limit: number = 4) {
    return this.http.get(`${this.apiUrl}/projects?limit=${limit}&recent=true`);
  }

  getProjectById(projectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}`);
  }

  addProjects(formData: FormData) {
    return this.http.post(`${this.apiUrl}/projects`, formData);
  }

  deleteProject(projectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}`);
  }

  bulkDeleteProjects(projectIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects/bulk-delete`, { project_ids: projectIds });
  }

  updateProject(projectId: number, formData: FormData): Observable<any> {
    formData.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/projects/${projectId}`, formData);
  }

  // ==================== Categories ====================
  getCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/category`);
  }

  getProjectsByCategory(categoryId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    const url = `${this.apiUrl}/category/${categoryId}/projects`;
    console.log('API Service - getProjectsByCategory called with:', { categoryId, params, url, httpParams });

    return this.http.get(url, { params: httpParams });
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

  updateCategory(id: number, data: FormData) {
    data.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/category/${id}`, data);
  }

  deletecategories(id: number) {
    return this.http.delete(`${this.apiUrl}/category/${id}`);
  }

  // ==================== Education ====================
  getEducations() {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/education?_t=${timestamp}`);
  }

  geteducationById(id: number) {
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

  // ==================== Experience ====================
  getExperiences() {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/experience?_t=${timestamp}`);
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

  // ==================== Skills ====================
  getSkills(): Observable<any> {
    // Skills don't change often, so we can use HTTP caching
    // The browser will cache this response based on Cache-Control headers
    return this.http.get(`${this.apiUrl}/skills`, {
      headers: {
        'Cache-Control': 'max-age=900' // 15 minutes HTTP cache
      }
    });
  }

  getSkillById(id: number) {
    return this.http.get(`${this.apiUrl}/skills/${id}`);
  }

  addskills(data: FormData) {
    return this.http.post(`${this.apiUrl}/skills`, data);
  }

  uptdateSkill(id: number, data: FormData) {
    data.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/skills/${id}`, data);
  }

  deleteSkill(id: number) {
    return this.http.delete(`${this.apiUrl}/skills/${id}`);
  }

  bulkDeleteSkills(skillIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/skills/bulk-delete`, { skill_ids: skillIds });
  }

  // ==================== Contacts ====================
  getContacts() {
    return this.http.get<any[]>(`${this.apiUrl}/admin/contacts`);
  }

  deleteContact(id: number) {
    return this.http.delete(`${this.apiUrl}/admin/contacts/${id}`);
  }

  setCoverImage(projectId: number, imageId: number) {
    return this.http.put(`${this.apiUrl}/projects/${projectId}/cover`, { image_id: imageId });
  }

  // ==================== CV ====================
  getCVs() {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/cvs?_t=${timestamp}`);
  }

  getCVById(id: number) {
    return this.http.get(`${this.apiUrl}/cvs/${id}`);
  }

  getActiveCV() {
    return this.http.get(`${this.apiUrl}/cv/active`);
  }

  addCV(data: FormData) {
    return this.http.post(`${this.apiUrl}/cvs`, data);
  }

  updateCV(id: number, data: FormData) {
    data.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/cvs/${id}`, data);
  }

  deleteCV(id: number) {
    return this.http.delete(`${this.apiUrl}/cvs/${id}`);
  }
}
