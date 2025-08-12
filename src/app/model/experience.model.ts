export interface  Experience 
{
    id?: number;
    user_id: [];
    year_start: Date;
    year_end: Date | null;
    poste: string;
    place: string;
    city: string;
    currently_working: boolean;  // add this

}
