import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import jwt from "jsonwebtoken";
import UserService from "../services/UserService";
import { User, Verified } from "../models/user";

const router = Router();

router.get("/verifyKYC", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userService = Container.get(UserService);

        const token = req.headers.authorization?.split(" ")[1];
        const decodedToken = jwt.decode(token as string) as { [key: string]: User };

        const user = decodedToken?.user as User;
        const existingUser = await userService.getUserByEmail(user.email);
        const verifiedStatus = existingUser?.verified;

        switch (verifiedStatus) {
            case "NO":
                res.status(200).json({ message: "not verified" });
                break;
            case "YES":
                res.status(200).json({ message: "verified" });
                break;
            case "REJECTED":
                res.status(200).json({ message: "rejected" });
                break;
            case "PENDING":
                res.status(200).json({ message: "pending" });
                break;
            case "HOLD":
                res.status(200).json({ message: "hold" });
                break;
        }
    } catch (error) {
        console.log(error);
    }
});

router.post("/webhook", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userService = Container.get(UserService);

        // Get customer's email
        const externalUserId = req.body.externalUserId;
        const splitExternalUserId = externalUserId.split("_");
        const email = splitExternalUserId[0];

        // Search DB using the email
        const existingUser = (await userService.getUserByEmail(email)) as User;

        if (existingUser) {
            // Handle webhooks
            const webhookType = req.body.type;

            switch (webhookType) {
                case "applicantPending":
                    await userService.updateUserKYCStatus(existingUser, Verified.PENDING);
                    break;
                case "applicantReset":
                    await userService.updateUserKYCStatus(existingUser, Verified.NO);
                    break;
                case "applicantOnHold":
                    await userService.updateUserKYCStatus(existingUser, Verified.HOLD);
                    break;
                case "applicantReviewed":
                    if (req.body.reviewResult.reviewAnswer === "GREEN") {
                        await userService.updateUserKYCStatus(existingUser, Verified.YES);
                    } else if (
                        req.body.reviewResult.reviewAnswer === "RED" &&
                        req.body.reviewResult.reviewRejectType === "FINAL"
                    ) {
                        await userService.updateUserKYCStatus(existingUser, Verified.REJECTED);
                    } else {
                        // TODO: implement a more extended approach, that will also handle typing errors or document clarity issue
                        await userService.updateUserKYCStatus(existingUser, Verified.HOLD);
                    }
                    break;
            }
        } else {
            throw Error("Could not find the user!");
        }
    } catch (error) {
        console.log(error);
    }
});

export default router;
