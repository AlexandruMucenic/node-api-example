import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import { Container } from "typedi";
import bcrypt from "bcrypt";
import config from "../../config";
import { User } from "../models/user";
import UserService from "../services/UserService";
import { UserDTO } from "../DTOs/UserDTO";

// Local strategy for registration
passport.use(
    "local-register",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, email, password, done) => {
            try {
                const userService = Container.get(UserService);
                const existingUser = await userService.getUserByEmail(email);
                if (!req.body.fullName) {
                    return done(null, false, { message: "Full name is required." });
                }
                if (existingUser) {
                    return done(null, false, { message: "Email already in use." });
                }

                // Hash the password before saving it to the database
                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = {
                    fullName: req.body.fullName,
                    email,
                    password: hashedPassword,
                };

                const createdUser = await userService.createUser(newUser as unknown as UserDTO);
                return done(null, createdUser);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Local strategy for login
passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email, password, done) => {
            try {
                const userService = Container.get(UserService);

                const user = await userService.getUserByEmail(email);
                if (!user) {
                    return done(null, false, { message: "Incorrect email or password." });
                }

                const validate = await userService.comparePasswords(user, password);
                if (!validate) {
                    return done(null, false, { message: "Incorrect email or password." });
                }
                return done(null, user, { message: "User logged in successfully." });
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Google Oauth strategy
passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: config.google.clientID as string,
            clientSecret: config.google.clientSecret as string,
            callbackURL: config.google.callbackURL as string,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userService = Container.get(UserService);
                const googleEmail = profile.emails ? profile.emails[0].value : undefined;

                if (googleEmail) {
                    const user = await userService.getUserByEmail(googleEmail);

                    if (user) {
                        return done(null, user);
                    }

                    const newUser = {
                        googleId: profile.id,
                        fullName: profile.displayName,
                        email: googleEmail,
                    };

                    const createdUser = await userService.createUser(newUser as unknown as UserDTO);

                    return done(null, createdUser);
                } else {
                    return done(null, false, {
                        message: "Google email was not found. Make sure that the address is correct.",
                    });
                }
            } catch (error: any) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: User, done) => {
    done(null, user);
});

export default passport;
