# SMS Parser Backend

Simple hackathon-ready backend with Express and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Health check
- `GET /api/sms` - Get all SMS messages
- `GET /api/sms/:id` - Get single SMS by ID
- `POST /api/sms` - Create new SMS
- `PUT /api/sms/:id` - Update SMS
- `DELETE /api/sms/:id` - Delete SMS

## Example Request

```bash
POST /api/sms
{
  "sender": "BANK-ALERT",
  "message": "Your account has been debited with Rs.500",
  "category": "transaction",
  "amount": 500
}
```

Server runs on port 3000 by default.
