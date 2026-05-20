export interface FoodNode {
    id: string;
    name: string;
    route: string;
    active?: boolean;
    expanded?: boolean;
    children?: FoodNode[];
    icon: string;
}
