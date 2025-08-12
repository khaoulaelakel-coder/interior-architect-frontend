export interface Project {
    [x: string]: any;
    user_id: number;
    id?: number;
    name: string;
    description: string;
    category_id: string;
    images?: { image_url: File }[]; // Change this to match backend
    showFullDesc?: boolean;
}