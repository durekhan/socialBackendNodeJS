export interface PostDto {
    userID: string;
    caption: string;
    image: string;
    createdAt:Date;
    updatedAt?: Date;
}