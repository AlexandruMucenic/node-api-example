import { Schema, model, Model } from "mongoose";
import { billingInfoSchema } from "./billingInfo";
import { paymentDetailsSchema } from "./paymentDetails";
import { UserDocument, Role, Verified } from "../models/user";

const userSchema = new Schema<UserDocument>(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        googleId: { type: String },
        verified: { type: String, enum: Object.values(Verified), default: Verified.NO },
        role: { type: String, enum: Object.values(Role), default: Role.CUSTOMER },
        registeredAt: { type: Date, default: Date.now },
        paymentDetails: { type: paymentDetailsSchema },
        billingInfo: { type: billingInfoSchema },
        hasActiveSubscription: { type: Boolean, default: false },
        hasActivePrepaid: { type: Boolean, default: false },
        hasPurchaseHistory: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Database context for mongoose
export const UserContext: Model<UserDocument> = model<UserDocument>("User", userSchema);
