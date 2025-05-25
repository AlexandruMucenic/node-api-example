import "reflect-metadata";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import { Container } from "typedi";
import bodyParser from "body-parser";
import config from "../config";
import passport from "./middleware/passport";
import authRoutes from "./routes/auth";
import kycRoutes from "./routes/kyc";
import billingRoutes from "./routes/billing";
import mongoose from "mongoose";
import MongoUserRepository from "./repository/UserRepository";

const app: Application = express();
Container.set("IUserRepository", MongoUserRepository);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    session({
        secret: config.sessionSecret as string,
        resave: true,
        saveUninitialized: true,
    })
);
app.use(cors());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/billing", billingRoutes);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).send("API health check passed successfully!");
});

async function main() {
    await mongoose.connect(config.mongoUri as string);
    console.log("Established connection to MongoDB.");

    app.listen(config.port, () => {
        console.log(`Server is listening on port ${config.port}...`);
    });
}

main().catch((error) => {
    console.log(error);
});
