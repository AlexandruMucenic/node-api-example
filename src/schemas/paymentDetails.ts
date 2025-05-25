import { Schema } from "mongoose";
import { PaymentDetails } from "../models/user";

export const paymentDetailsSchema = new Schema<PaymentDetails>({
    cardNumber: { type: String, required: true },
    cardHolderName: { type: String, required: true },
    expirationDate: { type: String, required: true },
    cvv: { type: String, required: true },
});
