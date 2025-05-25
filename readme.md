# Node API

A modular Node.js/Express API with JWT authentication, Google OAuth, user management, Know Your Customer (KYC) verification & Subscriptions billing integration
(Stripe), and MongoDB persistence via Mongoose.

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [Usage](#usage)
6. [Code Overview](#code-overview)
    - [Configuration (`config/index.ts`)](#configuration-configindexts)
    - [Data Transfer Objects (`DTOs/`)](#data-transfer-objects-dtos)
    - [Models & Schemas (`models/` & `schemas/`)](#models--schemas-models--schemas)
    - [Repository Layer (`repository/`)](#repository-layer-repository)
    - [Service Layer (`services/`)](#service-layer-services)
    - [Middleware (`middleware/`)](#middleware-middleware)
    - [Routes (`routes/`)](#routes-routes)
    - [Server Bootstrap (`app.ts`)](#server-bootstrap-appts)
7. [API Endpoints](#api-endpoints)

---

## Features

-   **Environment-based configuration** via `dotenv`
-   **JWT** authentication & authorization
-   **Passport** strategies: Local (register/login) + Google OAuth
-   **User Management**: Create, update, find by email/ID
-   **KYC** status checks & webhooks
-   **Billing**: Stripe subscription & payment-intent flows + webhooks
-   **MongoDB** persistence with Mongoose + TypeDI for DI

---

## Prerequisites

-   Node.js ≥ 14.x
-   npm or yarn
-   MongoDB instance (atlas or local)
-   Stripe account & API keys
-   Google OAuth credentials

---

## Installation

```bash
git clone https://github.com/AlexandruMucenic/node-api-example.git
cd node-api-example
npm install
```

---

## Environment Variables

Create a `.env` in the project root:

```
PORT=3000
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONT_END_URL=https://yourfrontend.com
DB_CONN=your_db_connection_string
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=sk_test_...
```

---

## Usage

1. Start MongoDB (if local).
2. Run the server:
    ```bash
    npm run build
    npm start
    ```
3. Health check:
    ```
    GET http://localhost:3000/
    → “API health check passed successfully!”
    ```

---

## Code Overview

### Configuration (`config/index.ts`)

-   Loads `.env` via `dotenv.config()`.
-   Exports port, JWT secret, Google OAuth settings, front-end URL, MongoDB URI, session secret.

### Data Transfer Objects (`DTOs/`)

-   **UserDTO** defines the public shape of user data:
    ```ts
    export interface UserDTO {
        fullName: string;
        email: string;
        password?: string;
    }
    ```

### Models & Schemas (`models/` & `schemas/`)

-   **`models/user.ts`** — TypeScript interfaces & enums for `User`, KYC status, Role, payment & billing details.
-   **`schemas/*.ts`** — Mongoose schema definitions for nested objects (billingInfo, paymentDetails) and `UserContext`.

### Repository Layer (`repository/`)

-   **`MongoUserRepository`** implements `IUserRepository` with methods:
    -   `create(user)`
    -   `update(id, newUser)`
    -   `findById(id)`
    -   `findByEmail(email)`

### Service Layer (`services/`)

-   **`UserService`** orchestrates business logic & repository calls:
    -   `createUser`, `getUserById`, `getUserByEmail`
    -   `comparePasswords` (bcrypt)
    -   `updateUserSubscriptionStatus`, `updateUserPrepaidStatus`, `updateUserPurchaseHistoryStatus`,
        `updateUserKYCStatus`

### Middleware (`middleware/`)

-   **JWT (`jwt.ts`)** – extracts token, verifies via `jsonwebtoken`, returns 401/403 or “verified”.
-   **Passport (`passport.ts`)** – configures three strategies:
    -   **Local-register**: checks fullName & existing email, hashes password with bcrypt
    -   **Local-login**: verifies email & password
    -   **Google OAuth**: creates or finds user by Google profile

### Routes (`routes/`)

-   **`auth.ts`** –
    -   `POST /register` → local-register → returns JWT
    -   `POST /login` → local-login → returns JWT
    -   `GET /verify` → JWT verification
    -   `GET /google` & `/google/callback` → Google OAuth flow
-   **`billing.ts`** –
    -   `GET /verifySubscription` → checks active subscription/prepaid on user
    -   `POST /payment` → creates Stripe PaymentIntent or Subscription
    -   `POST /webhook` → handles Stripe webhooks (payment_intent.succeeded, subscription.created/deleted,
        charge.refunded)
-   **`kyc.ts`** –
    -   `GET /verifyKYC` → returns KYC status
    -   `POST /webhook` → updates KYC status based on external service callbacks

### Server Bootstrap (`index.ts`)

-   Sets up Express, CORS, sessions, body parsing, dependency injection (TypeDI), Passport init.
-   Connects to MongoDB and starts listening on configured port.

---

## API Endpoints

| Method | Path                              | Description                                           |
| ------ | --------------------------------- | ----------------------------------------------------- |
| GET    | `/`                               | Health check                                          |
| POST   | `/api/auth/register`              | Register new user, returns JWT                        |
| POST   | `/api/auth/login`                 | Login existing user, returns JWT                      |
| GET    | `/api/auth/verify`                | Verify JWT token                                      |
| GET    | `/api/auth/google`                | Initiate Google OAuth                                 |
| GET    | `/api/auth/google/callback`       | Google OAuth callback, redirects front-end with token |
| GET    | `/api/billing/verifySubscription` | Check user subscription/prepaid status                |
| POST   | `/api/billing/payment`            | Create payment intent or subscription                 |
| POST   | `/api/billing/webhook`            | Stripe webhook handler                                |
| GET    | `/api/kyc/verifyKYC`              | Check user KYC status                                 |
| POST   | `/api/kyc/webhook`                | KYC provider webhook handler                          |

---
