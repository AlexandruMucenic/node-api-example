import { User } from "../models/user";

export interface IUserRepository {
    create(user: User): Promise<User>;
    update(id: String, newUser: User): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    // TODO: Add more functionality
}
