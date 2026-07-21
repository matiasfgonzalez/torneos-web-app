export interface IUser {
    id: string;
    clerkUserId: string;
    email: string;
    name: string;
    imageUrl: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

/**
 * Autor expuesto en las noticias (públicas): solo campos NO sensibles.
 * Refleja `newsAuthorSelect` — sin email/phone/role/DNI (M1).
 */
export interface INewsAuthor {
    id: string;
    name: string;
    imageUrl: string;
    createdAt: string | Date;
}

export interface INoticia {
    id: string;
    title: string;
    summary: string;
    content: string;
    coverImageUrl: string;
    coverImagePublicId?: string;
    published: boolean;
    publishedAt: string | Date;
    userId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    user: INewsAuthor;
}

