import { Service, Inject } from "typedi";
import { IUserRepository } from "../interfaces/IUserRepository";
import { User, Verified } from "../models/user";
import { UserDTO } from "../DTOs/UserDTO";
import bcrypt from "bcrypt";

/**
 * UserService is responsible for handling user-related operations.
 * It uses the IUserRepository interface to interact with the data layer.
 */
@Service()
export default class UserService {
    @Inject("userRepository")
    private userRepository!: IUserRepository;

    constructor() {}

    /**
     * createUser creates a new user with the provided UserDTO object.
     * It calls the userRepository.create method to save the new user.
     *
     * @param {UserDTO} newUser - The UserDTO object containing the new user's information.
     * @returns {Promise<User>} The created User object.
     */
    public async createUser(newUser: UserDTO): Promise<User> {
        const createdUser = await this.userRepository.create(newUser as User);
        return createdUser;
    }

    /**
     * getUserById retrieves a user by its ID.
     * It calls the userRepository.findById method to get the user from the data layer.
     *
     * @param {string} id - The ID of the user to retrieve.
     * @returns {Promise<User | null>} The User object if found, or null if not found.
     */
    public async getUserById(id: string): Promise<User | null> {
        const user = await this.userRepository.findById(id);
        return user;
    }

    /**
     * getUserByEmail searches for a user with the specified email address.
     *
     * @param {string} email - The email address to search for.
     * @returns {Promise<User | null>} The User object if found, or null if not found.
     */
    public async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);
        return user;
    }

    /**
     * comparePasswords checks if the provided password matches the user's password in the database.
     *
     * @param user - The user object containing the stored password.
     * @param password - The password to check.
     * @returns A Promise that resolves to `true` if the password is valid, or `false` otherwise.
     */
    public async comparePasswords(user: User, password: string): Promise<boolean> {
        const comparePassword = await bcrypt.compare(password, user?.password as string);
        return comparePassword;
    }

    /**
     * updateUserSubscriptionStatus updates the subscription status for a user.
     * @param user - The user object to be updated.
     * @param subscriptionStatus - The new subscription status to be applied to the user.
     * @returns A Promise resolving to the updated user object.
     */
    public async updateUserSubscriptionStatus(user: User, subscriptionStatus: boolean) {
        const userId = user._id as string;
        user.hasActiveSubscription = subscriptionStatus;

        const updatedUser = await this.userRepository.update(userId, user);
        return updatedUser;
    }

    /**
     * updateUserPrepaidStatus updates the prepaid status for a user.
     * @param user - The user object to be updated.
     * @param prepaidStatus - The new prepaid status to be applied to the user.
     * @returns A Promise resolving to the updated user object.
     */
    public async updateUserPrepaidStatus(user: User, prepaidStatus: boolean) {
        const userId = user._id as string;
        user.hasActivePrepaid = prepaidStatus;

        const updatedUser = await this.userRepository.update(userId, user);
        return updatedUser;
    }

    /**
     * updateUserPurchaseHistoryStatus updates the purchase history status for a user.
     * @param user - The user object to be updated.
     * @param purchaseHistoryStatus - The new purchase history status to be applied to the user.
     * @returns A Promise resolving to the updated user object.
     */
    public async updateUserPurchaseHistoryStatus(user: User, purchaseHistoryStatus: boolean) {
        const userId = user._id as string;
        user.hasPurchaseHistory = purchaseHistoryStatus;

        const updatedUser = await this.userRepository.update(userId, user);
        return updatedUser;
    }

    /**
     * updateUserKYCStatus updates the KYC (Know Your Customer) status for a user.
     * @param user - The user object to be updated.
     * @param status - The new KYC status to be applied to the user.
     * @returns A Promise resolving to the updated user object.
     */
    public async updateUserKYCStatus(user: User, status: Verified) {
        const userId = user._id as string;
        user.verified = status;

        const updatedUser = await this.userRepository.update(userId, user);
        return updatedUser;
    }
}
