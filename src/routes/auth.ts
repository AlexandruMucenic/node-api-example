import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";
import passport from "../middleware/passport";
import { User } from "../models/user";
import { verifyToken } from "../middleware/jwt";
import { PassportMessage } from "../types";

const router = Router();

router.get("/verify", verifyToken);

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local-register", async (err: Error, user: User, info: PassportMessage) => {
        if (err || !user) {
            return res.status(401).json({ message: info.message });
        }

        const body = { _id: user._id, fullName: user.fullName, email: user.email, role: user.role };
        const token = jwt.sign({ user: body }, config.jwtSecret as string);

        return res.status(200).json({ token });
    })(req, res, next);
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("login", async (err: Error, user: User, info: PassportMessage) => {
        try {
            if (err || !user) {
                return res.status(401).json({ message: info.message });
            }

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                const body = { _id: user._id, fullName: user.fullName, email: user.email, role: user.role };
                const token = jwt.sign({ user: body }, config.jwtSecret as string);

                return res.status(200).json({ token });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "consent" })); //TODO: "profile" and "email" scopes, are considered "pre-approved" by Google, so it skips the consent screen. "Prompt", will ask the user to consent every time, to be removed after development

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${config.feURL}/auth` }),
    (req: Request, res: Response) => {
        try {
            const user = req?.user as User;

            const body = {
                _id: user?._id,
                fullName: user?.fullName,
                email: user?.email,
                role: user?.role,
            };

            const token = jwt.sign({ user: body }, config.jwtSecret as string);

            res.redirect(`${config.feURL}/auth/callback?token=${token}`);
        } catch (error) {
            return console.error(error);
        }
    }
);

export default router;
