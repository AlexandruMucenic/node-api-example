import { Router, Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { Container } from "typedi";
import jwt from "jsonwebtoken";
import { StripePaymentIntent, StripeCustomer, StripeProduct } from "../types";
import UserService from "../services/UserService";
import { User } from "../models/user";

const stripe = new Stripe("", {
    apiVersion: "2022-11-15",
});

const products = [
    {
        license: "Pay per Use",
        prodId: "prod_O2k1ue",
    },
    {
        license: "Starter",
        prodId: "prod_O2pZ2g",
    },
    {
        license: "Advanced",
        prodId: "prod_O2paiz",
    },
    {
        license: "Business",
        prodId: "prod_O2pb3d",
    },
    {
        license: "Corporate",
        prodId: "prod_O2pbzN",
    },
    {
        license: "Custom",
        prodId: "prod_O2pcTO",
    },
];

const router = Router();

router.get("/verifySubscription", async (req: Request, res: Response, next: NextFunction) => {
    const userService = Container.get(UserService);

    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.decode(token as string) as { [key: string]: User };

    const user = decodedToken?.user as User;
    const existingUser = await userService.getUserByEmail(user.email);

    if (existingUser?.hasActiveSubscription === true) {
        res.status(200).json({ message: "active" });
    } else if (existingUser?.hasActivePrepaid === true) {
        res.status(200).json({ message: "active" });
    } else {
        res.status(200).json({ message: "not active" });
    }
});

router.post("/payment", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, paymentMethod, requestedPlan } = req.body;

        // Retrieve the product
        const selectedPlan = products.find((item) => item.license === requestedPlan);
        const product: StripeProduct = await stripe.products.retrieve(selectedPlan?.prodId as string);
        const productId = product.id;

        //Search for the customer
        let customer: StripeCustomer;
        const customerSearchResult = await stripe.customers.search({ query: `email:\"${email}\"` });

        if (!customerSearchResult.data[0]) {
            // Create the customer
            customer = await stripe.customers.create({
                email,
                name,
                payment_method: paymentMethod,
                invoice_settings: { default_payment_method: paymentMethod },
            });
        } else {
            customer = customerSearchResult.data[0];

            // Update the payment method
            await stripe.paymentMethods.attach(paymentMethod, { customer: customer.id });
            await stripe.customers.update(customer.id, {
                invoice_settings: { default_payment_method: paymentMethod },
            });
        }

        if (requestedPlan === "Pay per Use") {
            // Create payment intent for prepaid option
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 1000,
                currency: "usd",
                payment_method: paymentMethod,
                customer: customer.id,
                metadata: { productId },
            });

            // Return secret to client
            const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
            return res.status(200).json({ clientSecret: confirmedIntent.client_secret });
        } else {
            // Create the subscription
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [
                    {
                        price: product.default_price as string,
                    },
                ],
                expand: ["latest_invoice.payment_intent"],
            });

            // Return secret to client
            const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
            const clientSecret = (latestInvoice?.payment_intent as StripePaymentIntent)?.client_secret;

            res.status(200).json({
                message: "Subscription successfully initiated",
                clientSecret: clientSecret,
            });
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post("/webhook", async (req: Request, res: Response, next: NextFunction) => {
    const userService = Container.get(UserService);
    let customer: any;
    const customerId = req.body.data?.object?.customer;
    const webhookType = req.body.type;
    console.log(req.body);

    switch (webhookType) {
        case "payment_intent.succeeded":
            // Update user purchase history
            if (req.body.data.object.status === "succeeded") {
                if (customerId) {
                    customer = await stripe.customers.retrieve(customerId);
                    const existingUser = (await userService.getUserByEmail(customer?.email)) as User;
                    await userService.updateUserPurchaseHistoryStatus(existingUser, true);
                }
            }

            // Update user prepaid status
            if (req.body.data.object.status === "succeeded" && req.body.data.object.amount === 1000) {
                if (customerId) {
                    customer = await stripe.customers.retrieve(customerId);
                    const existingUser = (await userService.getUserByEmail(customer?.email)) as User;
                    await userService.updateUserPrepaidStatus(existingUser, true);
                }
            }
            break;
        case "customer.subscription.created":
            // Update user subscription status to true
            if (req.body.data.object.status === "active") {
                if (customerId) {
                    customer = await stripe.customers.retrieve(customerId);
                    const existingUser = (await userService.getUserByEmail(customer?.email)) as User;
                    await userService.updateUserSubscriptionStatus(existingUser, true);
                }
            }
            break;
        case "customer.subscription.deleted":
            // Update user subscription status to false
            if (req.body.data.object.status === "canceled") {
                if (customerId) {
                    customer = await stripe.customers.retrieve(customerId);
                    const existingUser = (await userService.getUserByEmail(customer?.email)) as User;
                    await userService.updateUserSubscriptionStatus(existingUser, false);
                }
            }
            break;
        case "charge.refunded":
            if (req.body.data.object.amount === 1000) {
                if (customerId) {
                    customer = await stripe.customers.retrieve(customerId);
                    const existingUser = (await userService.getUserByEmail(customer?.email)) as User;
                    await userService.updateUserPrepaidStatus(existingUser, false);
                }
            }
            break;
        default:
            res.status(200);
    }
});

export default router;
