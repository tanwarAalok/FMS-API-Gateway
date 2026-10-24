# FMS API Gateway

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white) ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?logo=sequelize&logoColor=white) ![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

The API gateway of the **Flight Management System (FMS)**, a set of Node.js microservices for searching flights and booking seats. The gateway is the single entry point: it handles sign-up and sign-in, issues and verifies JWTs, enforces role-based access, rate-limits every client and reverse-proxies requests to the flight and booking services.

## Architecture

```
                         ┌───────────────────────────────┐
 client ──▶ rate limit ──▶          API Gateway           │
            (100 req /   │  /api/v1/signup, /signin, /role│──▶ MySQL (users, roles)
             15 min/IP)  │  /flightService/*  ────────────┼──▶ Flight Service
                         │  /bookingService/* ────────────┼──▶ Booking Service
                         └───────────────────────────────┘
```

| Service | Repository |
| --- | --- |
| API Gateway | this repository |
| Flight Service | [FMS-Flight-Service](https://github.com/tanwarAalok/FMS-Flight-Service) |
| Booking Service | [FMS-Booking-Service](https://github.com/tanwarAalok/FMS-Booking-Service) |
| Notification Service | [FMS-Notification-Service](https://github.com/tanwarAalok/FMS-Notification-Service) |

## Features

- **Authentication:** sign-up with bcrypt-hashed passwords, sign-in that returns a JWT, and a `checkAuth` middleware that reads the token from the `x-access-header` header.
- **Authorisation:** `admin`, `customer` and `company` roles (many-to-many user ↔ role); only admins can grant roles.
- **Rate limiting** with `express-rate-limit`: 100 requests per IP every 15 minutes.
- **Reverse proxy** with `http-proxy-middleware`: `/flightService/*` and `/bookingService/*` are forwarded to the downstream services.
- Layered structure (routes → controllers → services → repositories), central error handling and Winston logging.

## Endpoints

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| `POST` | `/api/v1/signup` | | Create a user (`email`, `password`) |
| `POST` | `/api/v1/signin` | | Returns a JWT |
| `POST` | `/api/v1/role` | admin | Add a role to a user |
| `GET` | `/api/v1/info` | user | Health check |
| `*` | `/flightService/*` | | Proxied to the Flight Service |
| `*` | `/bookingService/*` | | Proxied to the Booking Service |

## Run locally

Requires Node.js and MySQL.

```bash
git clone https://github.com/tanwarAalok/FMS-API-Gateway.git
cd FMS-API-Gateway
npm install
```

Create `.env` in the project root:

```env
PORT=3001
SALT_ROUNDS=8
JWT_SECRET=change-me
JWT_EXPIRE=1d
FLIGHT_SERVICE_URL=http://localhost:3000
BOOKING_SERVICE_URL=http://localhost:4000
```

Set up the database (inside `src/`, `npx sequelize init:config` creates `config/config.json`; fill in your MySQL credentials there):

```bash
cd src
npx sequelize init:config
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all     # adds the admin, customer and company roles
cd ..
npm run dev
```
