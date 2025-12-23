# API & Integration Specifications

## 1. REST API Standards
- **Base URL**: `https://api.mclinic.com/v1`
- **Authentication**: Bearer Token (JWT).
- **Format**: JSON.
- **Errors**: Standard HTTP codes (400, 401, 403, 404, 500) with detailed error messages.

## 2. Core Endpoints

### 2.1 Authentication (`/auth`)
| Method | Endpoint | Description | Payload |
|:---:|:---:|:---|:---|
| POST | `/register/patient` | Register new patient | `{ "phone": "+254...", "password": "...", "bio": {...} }` |
| POST | `/login` | Login user | `{ "phone": "...", "password": "..." }` |
| POST | `/verify-otp` | Verify 2FA | `{ "otp": "123456" }` |
| POST | `/refresh-token` | Refresh JWT | `{ "refreshToken": "..." }` |

### 2.2 Patient (`/patients`)
| Method | Endpoint | Description |
|:---:|:---:|:---|
| GET | `/me` | Get current profile |
| PUT | `/me` | Update profile |
| GET | `/me/history` | medical history |
| POST | `/me/devices/sync` | Sync wearable data |

### 2.3 Provider (`/providers`)
| Method | Endpoint | Description |
|:---:|:---:|:---|
| GET | `/search` | Search doctors `?query=cardio&lat=...&long=...` |
| GET | `/:id` | Get public profile & availability |
| GET | `/:id/slots` | Get available booking slots |

### 2.4 Appointments (`/appointments`)
| Method | Endpoint | Description |
|:---:|:---:|:---|
| POST | `/` | Book appointment `{ "providerId": "...", "slotId": "..." }` |
| GET | `/` | List my appointments |
| PATCH | `/:id/cancel` | Cancel booking |

## 3. Integration Contracts

### 3.1 Payment Gateway (M-Pesa Callback)
**Endpoint**: `POST /webhooks/mpesa/callback`
```json
{
  "TransactionType": "Pay Bill",
  "TransID": "LGH5...",
  "TransTime": "20250215120000",
  "TransAmount": "1500",
  "BusinessShortCode": "174379",
  "BillRefNumber": "APPT-10293",
  "MSISDN": "254700000000"
}
```

### 3.2 Wearable Data Sync (Standardized Payload)
**Endpoint**: `POST /me/devices/sync`
```json
{
  "source": "AppleHealth",
  "deviceId": "UUID-...",
  "metrics": [
    {
      "type": "heart_rate",
      "value": 78,
      "unit": "bpm",
      "timestamp": "2025-02-15T10:00:00Z"
    },
    {
      "type": "steps",
      "value": 4500,
      "unit": "count",
      "timestamp": "2025-02-15T12:00:00Z"
    }
  ]
}
```
