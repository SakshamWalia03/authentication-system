# Authentication System

A REST API for user authentication built with Node.js, Express, and MongoDB.

## Features

- User registration and login
- Email verification via OTP
- JWT-based authentication (access + refresh tokens)
- Refresh token rotation
- Multi-device session tracking
- Logout single session or all sessions
- Rate-limited OTP resend

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose
- **Auth:** JSON Web Tokens (jsonwebtoken)
- **Hashing:** bcryptjs
- **Email:** Gmail API (googleapis)
- **Config:** dotenv

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB
- Gmail account with Google Cloud OAuth2 credentials

### Installation
```bash
git clone https://github.com/SakshamWalia03/authentication-system.git
cd authentication-system
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:
```env
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_USER=
GOOGLE_REFRESH_TOKEN=
PORT=8000
```

> **Note:** The refresh token must be generated with the `https://www.googleapis.com/auth/gmail.send` scope.
> Use [Google OAuth Playground](https://developers.google.com/oauthplayground) with your own credentials to generate it.

### Run
```bash
# Development
npm run dev

# Production
node server.js
```

## API Endpoints

Base URL: `/api/auth`

| Method | Endpoint       | Auth Required | Description               |
|--------|----------------|---------------|---------------------------|
| POST   | /register      | No            | Register a new user       |
| POST   | /login         | No            | Login and get tokens      |
| POST   | /verify-email  | No            | Verify email with OTP     |
| POST   | /resend-otp    | No            | Resend verification OTP   |
| POST   | /refresh-token | No            | Get a new access token    |
| GET    | /details       | Yes           | Get current user info     |
| POST   | /logout        | Yes           | Logout current session    |
| POST   | /logout-all    | Yes           | Logout all sessions       |

Protected routes require `Authorization: Bearer <accessToken>` header.

## Project Structure
```
authentication-system/
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controller/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── otp.model.js
│   │   └── session.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── services/
│   │   └── sendEmail.js
│   └── utils/
│       └── generate.js
└── .env.example
```

## License

ISC
