import dotenv from "dotenv";

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // Change The "Authorized redirect URI" from https://console.cloud.google.com/apis/credentials/ to match this one here
    },
    feURL: process.env.FRONT_END_URL,
    mongoUri: process.env.DB_CONN,
    sessionSecret: process.env.SESSION_SECRET,
};
