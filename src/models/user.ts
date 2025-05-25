import { Document } from "mongoose";

export interface User {
    _id?: string;
    fullName: string;
    email: string;
    password?: string;
    googleId?: string;
    verified?: Verified;
    role: Role;
    paymentDetails?: PaymentDetails;
    billingInfo?: BillingInfo;
    hasActiveSubscription?: boolean;
    hasActivePrepaid?: boolean;
    hasPurchaseHistory?: boolean;
    registeredAt?: Date;
}

export enum Verified {
    NO = "NO",
    HOLD = "HOLD",
    PENDING = "PENDING",
    YES = "YES",
    REJECTED = "REJECTED",
}

export enum Role {
    ADMIN = "ADMIN",
    CUSTOMER = "CUSTOMER",
    SALES = "SALES",
    DEMO = "DEMO",
}

export interface PaymentDetails {
    cardNumber: string;
    cardHolderName: string;
    expirationDate: string;
    cvv: string;
}

export interface BillingInfo {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    billingEmail: string;
    billingPhone: string;
    taxId?: string;
    companyName?: string;
    additionalNotes?: string;
}

// for mongoose
export interface UserDocument extends User, Document {
    _id: string;
}
