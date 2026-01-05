import { User as PrismaUser } from '@prisma/client';
export declare class User implements PrismaUser {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
