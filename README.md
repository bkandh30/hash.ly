# Hash.ly - Modern URL Shortener

A production-ready URL shortener with QR code generation, click analytics, and automatic expiration.
Built with Next.js, Turso, TypeScript, TailwindCSS, and Upstash Redis.

**Live Demo**: [https://hash-ly.vercel.app](https://hash-ly.vercel.app)

## Features

### Core Functionality

- **Short Link Generation** - Base62 encoding for compact, readable URLs
- **Click Analytics** - Real-time tracking with privacy-focused IP hashing
- **Auto Expiration** - 30-day default expiry with graceful 410 handling
- **QR Code Generation** - Dynamic PNG/SVG generation with customizable sizes
- **Rate Limiting** - 20 requests/minute per IP using distributed Redis
- **SSRF Protection** - Blocks private networks and malicious URLs
- **Local Dashboard** - Browser-based link management with localStorage

### Technical Specifications

- Global database replication with distributed SQLite
- Serverless edge functions with automatic scaling
- Type-safe implementation with comprehensive validation
- RESTful API with proper HTTP status codes
- Built-in health monitoring and status endpoints

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0
- **Database**: Turso (Distributed SQLite)
- **ORM**: Drizzle ORM
- **Cache/Rate Limiting**: Upstash Redis
- **Styling**: Tailwind CSS
- **Deployment**: Vercel Edge Functions

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- [Turso](https://turso.tech) account for database
- [Upstash](https://upstash.com) account for Redis
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/bkandh30/hash-ly.git
cd hash-ly
```

2. Install dependencies

```bash
pnpm install
```

3. Configure environment variables

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Security
IP_HASH_SALT=your-random-salt-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Initialize database

```bash
pnpm db:push
```

5. Start development server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## API Reference

### Base URLs

- **Production**: `https://hash-ly.vercel.app`
- **Development**: `http://localhost:3000`

### Endpoints

#### POST /api/links

Create a new short link.

**Request**

```http
POST /api/links
Content-Type: application/json

{
  "longUrl": "https://example.com/very-long-url"
}
```

**Response** (201 Created)

```json
{
  "shortId": "abc1234",
  "shortUrl": "https://hash-ly.vercel.app/s/abc1234",
  "longUrl": "https://example.com/very-long-url",
  "createdAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2024-01-31T00:00:00Z"
}
```

#### GET /api/links/{shortId}

Retrieve link statistics.

**Response** (200 OK)

```json
{
  "shortId": "abc1234",
  "longUrl": "https://example.com",
  "clicks": 42,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastAccess": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-31T00:00:00Z",
  "status": "active"
}
```

#### POST /api/links/batch-stats

Retrieve statistics for multiple links.

**Request**

```http
POST /api/links/batch-stats
Content-Type: application/json

{
  "shortIds": ["abc1234", "def5678"]
}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "abc1234": {
      "shortId": "abc1234",
      "longUrl": "https://example.com",
      "clicks": 42,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastAccess": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-01-31T00:00:00Z",
      "status": "active"
    }
  },
  "requested": 2,
  "found": 1
}
```

#### GET /api/links/{shortId}/qr

Generate QR code for a short link.

**Query Parameters**

- `fmt`: Output format - `png` or `svg` (default: `png`)
- `size`: Image size - 64 to 1024 pixels (default: 256)
- `margin`: Quiet zone margin - 0 to 10 (default: 2)

#### GET /api/healthz

Health check endpoint.

**Response** (200 OK)

```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-01T00:00:00Z",
  "linksCount": 1234
}
```

#### GET /api/status

System status and metrics.

**Response** (200 OK)

```json
{
  "status": "operational",
  "services": {
    "database": "operational",
    "redis": "operational"
  },
  "stats": {
    "totalLinks": 1234,
    "totalClicks": 5678
  }
}
```

### Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Error Codes**

- `INVALID_URL` - Invalid URL format or blocked host
- `RATE_LIMITED` - Too many requests (429)
- `NOT_FOUND` - Link not found (404)
- `EXPIRED` - Link has expired (410)
- `INTERNAL_ERROR` - Server error (500)

## Security Features

- **SSRF Protection**: Blocks localhost, private IP ranges, and cloud metadata endpoints
- **Rate Limiting**: Distributed Redis-based limiting across all edge locations
- **Input Validation**: Comprehensive Zod schemas for all user inputs
- **Privacy Protection**: IP addresses are hashed with salt before storage
- **HTTPS Enforcement**: Required in production environment
- **Content Security Policy**: Restrictive CSP headers in production

## Configuration

### Rate Limiting

Default: 20 requests per minute per IP address. Configure in `lib/rate-limit.ts`.

### Link Expiration

Default: 30 days. Configure in `app/api/links/route.ts`.

### Database Connection Pooling

Configured for serverless environments with connection reuse.

## Environment Variables

| Variable                   | Description                        | Required           |
| -------------------------- | ---------------------------------- | ------------------ |
| `TURSO_DATABASE_URL`       | Turso database connection URL      | Yes                |
| `TURSO_AUTH_TOKEN`         | Turso authentication token         | Yes                |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST API URL         | Yes                |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token | Yes                |
| `IP_HASH_SALT`             | Salt for IP address hashing        | Yes                |
| `NEXT_PUBLIC_APP_URL`      | Public application URL             | Auto-set by Vercel |

## Development

### Database Commands

```bash
# Generate database migrations
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Run migrations
pnpm db:migrate
```

### Build Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Analyze bundle size
pnpm analyze
```

## Deployment

This application is optimized for Vercel deployment with automatic environment variable detection. The production build includes:

- Bundle optimization and tree shaking
- Image optimization with multiple formats
- Edge runtime for global performance
- Automatic security headers
- Source map generation disabled for production

## Architecture

### Database Schema

- **links**: Stores URL mappings with metadata
- **clicks**: Tracks individual click events for analytics

### API Design

RESTful endpoints with proper HTTP status codes, comprehensive error handling, and consistent response formats.

### Security Implementation

Multi-layered security approach including input validation, rate limiting, SSRF protection, and privacy-conscious analytics collection.
