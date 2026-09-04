export type CategoryIcon = 
    | "web"
    | "mobile"
    | "devops"
    | "cyber"
    | "uxui"
    | "api"
    | "database"
    | "blockchain";

export type CategoryNavigationItem = {
    id: string | number;
    name: string;
    icon: CategoryIcon;
    slug: string;
};