import { Schema } from "mongoose";
import { BillingInfo } from "../models/user";

export const billingInfoSchema = new Schema<BillingInfo>({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: false },
    country: { type: String, required: true },
    postalCode: { type: String, required: false },
    billingEmail: { type: String, required: true },
    billingPhone: { type: String, required: true },
    taxId: { type: String },
    companyName: { type: String },
    additionalNotes: { type: String },
});
