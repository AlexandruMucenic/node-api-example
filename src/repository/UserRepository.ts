import { IUserRepository } from "../interfaces/IUserRepository";
import { UserContext } from "../schemas/user";
import { Service } from "typedi";
import { User, UserDocument } from "../models/user";
import { Model } from "mongoose";

/**
A repository class that implements the IUserRepository interface for interacting 
with MongoDB's User collection.
@implements {IUserRepository}
*/
@Service("userRepository")
export default class MongoUserRepository implements IUserRepository {
    /**
    The MongoDB model representing the User collection.
    */
    private userContext: Model<UserDocument>;

    public constructor() {
        this.userContext = UserContext;
    }

    /**
    Creates a new user in the User collection.
    @param {User} user - The user object to be created.
    @returns {Promise<User>} - A promise that resolves to the created user object.
    */
    public async create(user: User): Promise<User> {
        const createdUser = await this.userContext.create(user);
        return createdUser;
    }

    /**
     * Updates a user in the userContext collection with the specified ID.
     * @param id - The ID of the user to update.
     * @param newUser - The updated user data.
     * @returns A Promise resolving to the updated user document, or null if the user was not found.
     */
    public async update(id: string, newUser: User): Promise<User | null> {
        const updatedUser = await this.userContext.findByIdAndUpdate(id, newUser, { new: true });
        return updatedUser;
    }

    /**
    Finds a user in the User collection by its ID.
    @param {string} id - The ID of the user to find.
    @returns {Promise<User|null>} - A promise that resolves to the found user object, or 
    null if not found.
    */
    public async findById(id: string): Promise<User | null> {
        const user = await this.userContext.findById(id);
        return user;
    }

    /**
     * findByEmail searches for a user with the specified email address.
     *
     * @param {string} email - The email address to search for.
     * @returns {Promise<User | null>} The User object if found, or null if not found.
     */
    public async findByEmail(email: string): Promise<User | null> {
        const user = await this.userContext.findOne({ email });
        return user;
    }
}
