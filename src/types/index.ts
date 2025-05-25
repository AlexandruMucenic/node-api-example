import Stripe from "stripe";

// Passport
export interface PassportMessage {
    message: string;
}

// Stripe
export interface StripePaymentIntent {
    client_secret: string;
    status: string;
}

export interface StripeCustomer {
    id: string;
}

export interface StripeProduct {
    id: string;
    object: string;
    default_price?: string | Stripe.Price | null | undefined;
    active: boolean;
    attributes: string[] | null;
    created: number;
    description: string | null;
    livemode: boolean;
    metadata: {} | { productId: string };
    name: string;
    type: string;
    updated: number;
    url: string | null;
}
