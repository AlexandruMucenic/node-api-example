import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import config from "../../config";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "missing token" });
    }

    jwt.verify(token, config.jwtSecret as string, (err: VerifyErrors | null) => {
        if (err) {
            return res.status(403).json({ message: "failed" });
        } else {
            res.status(200).json({ message: "verified" });
        }

        next();
    });
};
