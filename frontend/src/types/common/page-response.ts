
export type PageResponse<Type> = {
    content: Type[],
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
};