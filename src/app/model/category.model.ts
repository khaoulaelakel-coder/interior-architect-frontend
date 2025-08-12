export interface category 
{
    id?: number;
    name: string;
    description: string;
    cover: string;
    createdAt?: Date;
    updatedAt?: Date;
}

 export interface CategoryResponse {
  data: category[];
  categories: category[];
}