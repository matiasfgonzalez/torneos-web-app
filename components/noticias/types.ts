export interface IUser {
    id: string;
    clerkUserId: string;
    email: string;
    name: string;
    imageUrl: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface INoticia {
    id: string;
    title: string;
    summary: string;
    content: string;
    coverImageUrl: string;
    published: boolean;
    date: string | Date;
    userId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    user: IUser;
}
