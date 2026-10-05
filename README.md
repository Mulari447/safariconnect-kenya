# SafariConnect Kenya

**Tour Operator CRM & Customer Lead Marketplace for Kenya**

SafariConnect connects travelers planning a trip to Kenya with licensed Kenyan tour operators. It is two products in one:

- **A traveler marketplace.** Travelers browse destinations, submit trip requests, receive and compare quotations, book, pay and review. Free for travelers.
- **A CRM for tour operators.** Operators receive matched leads and manage quotations, bookings, customers, tasks, payments and reports. Operators pay (subscription / lead access).

The platform owner (Super Admin) verifies operators, configures pricing and lead distribution, manages content, and monitors the whole ecosystem. Kenya first; the architecture is designed to expand across East Africa.

**Live app:** https://safariconnectkenya.co.ke

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Project status](#project-status)
3. [User roles](#user-roles)
4. [Core features](#core-features)
5. [Business rules](#business-rules)
6. [Getting started](#getting-started)
7. [Environment variables](#environment-variables)
8. [Project structure](#project-structure)
9. [Commands](#commands)
10. [Deployment](#deployment)
11. [Roadmap](#roadmap)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | TanStack Start, React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui (Radix) |
| Backend | PHP 8.2+, Laravel (REST API) |
| Database | MySQL (database name: `safariconnect`) |
| Auth | JWT, with Google / email / phone OTP for customers |
| Payments | M-Pesa STK Push via IntaSend; card payments (Visa / Mastercard) |
| Email | SMTP (Laravel Mail) |
| SMS | Africa's Talking |
| Maps | Google Maps |
| Files | Laravel Storage (cloud disk) |
| Queues | Laravel Queues and Scheduler |
| Documents | PDF generation (invoices, quotations) |
| Deployment | Docker, Nginx + PHP-FPM, Linux server |

> **Note:** the original product spec called for PostgreSQL and NestJS as options. The implemented backend uses **Laravel + MySQL**. Treat this README as the source of truth.

## Project status

The project was scaffolded in Lovable and is **migrating from Supabase to a self-hosted Laravel + MySQL backend**.

- Migrated / self-hosted: operator approval, lead quota enforcement, eligibility filtering, offer acceptance flow, M-Pesa STK push, SMTP email, PDF invoices.
- Anything still calling Supabase directly should be moved to the Laravel API. Before adding new features, check whether the module you touch has been migrated.

<!-- TODO (team): keep a checklist here of modules still on Supabase. -->

## User roles

**Super Admin** has full system access: verify, suspend or delete operators; manage subscriptions, pricing, commission and payment gateways; manage destinations, counties, parks and packages; manage CMS content (homepage, blogs, FAQs, testimonials, ads, partners, banners); configure email and SMS templates; view all leads, bookings, payments, analytics and audit logs; send announcements.

**Tour Operator** registers with company and compliance details (business registration number, KRA PIN, Tourism Regulatory Authority licence number, optional KATO membership, county, location, contacts, logo, specialties, vehicle types, languages). New operators stay **Pending** until an admin approves them.

**Customer / Traveler** registers via Google, email, or phone OTP, then submits trip requests, compares quotations, books, pays, and leaves reviews.

## Core features

### Operator CRM
- **Dashboard:** new / active / won / lost leads, bookings, revenue, subscription status, messages, notifications, tasks, calendar.
- **Lead management:** assign, change status, notes, follow-ups, tasks, mark won or lost, archive, search, filter, export.
- **Quotation builder:** accommodation, transport, park fees, meals, activities, guide and vehicle costs, taxes, discount, markup, total; PDF generation, email and WhatsApp sharing, version history, approval tracking.
- **Bookings:** convert quotation to booking; manage travelers, hotels, flights, transfers, vehicles, guides, drivers, payments, balances, receipts, invoices, travel documents.
- **Customer CRM:** passport, nationality, contacts, past trips, preferences, notes, documents, communication history.
- **Tasks and messaging:** reminders, calendar, internal messaging, email, SMS, WhatsApp.
- **Reports:** revenue, bookings, lead conversion, monthly sales, popular destinations, top customers, quotation success rate.

### Traveler marketplace
- Search and filter by destination, county, price, duration, activities, operator, accommodation, luxury level, availability, rating.
- Homepage with featured safaris and categories (family, luxury, budget, honeymoon, camping, bird watching, cultural, photography, adventure, and more).
- Destination pages covering all major Kenyan parks, reserves, coast, lakes and mountains (Maasai Mara, Amboseli, Tsavo, Nakuru, Naivasha, Samburu, Mount Kenya, Diani, Lamu, and others) with description, photos, season, activities, nearby hotels and operators.
- Trip request form, quotation comparison, accept / reject, booking history, invoices, wishlist.
- Reviews and ratings (operators, packages, hotels, destinations, guides, drivers) with photo uploads, verified-traveler badge, helpful votes and abuse reporting.

### Admin
- Subscription plans (Free, Basic, Professional, Enterprise): price, lead limits, storage, CRM access, reports, staff accounts, package limits, priority ranking, premium badge, featured listings.
- Lead distribution rules: nearest operator, premium subscribers, random, top-rated, county operators, destination specialists, max operators per lead, lead expiry.
- Analytics: revenue, MRR, ARR, operator and customer growth, conversion, payments, traffic.
- CMS, SEO controls, audit logs.

## Business rules

These rules are enforced in the backend; please do not bypass them in the UI.

1. **Operator approval:** operators cannot receive leads until approved by an admin.
2. **Lead quota:** lead access is limited by the operator's subscription plan.
3. **Eligibility filtering:** leads are routed only to operators matching the lead's county / tour category (and the admin-configured distribution rule).
4. **Contact reveal:** traveler contact details are hidden from operators **until the traveler accepts that operator's offer**.
5. **Payments:** M-Pesa STK Push runs through IntaSend. Failed payments follow the retry / reminder flow.
6. **Invoices:** PDF invoices are generated server-side.

## Getting started

### Prerequisites
- PHP 8.2+ with extensions: `mbstring`, `xml`, `curl`, `pdo_mysql`, `gd`, `zip`, `bcmath`
- Composer 2
- Node.js 20+ and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- MySQL 8+
- Git

### 1. Clone
```sh
git clone <this-repository-url>
cd <repository-name>
```

### 2. Backend setup (Laravel)
```sh
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
<!-- Adjust paths if the Laravel app lives elsewhere. -->

### 3. Create the database
```sql
CREATE DATABASE safariconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure environment
Fill in `backend/.env` (see [Environment variables](#environment-variables)).

### 5. Run migrations and seed
```sh
php artisan migrate
php artisan db:seed
php artisan storage:link
cd ..
```

### 6. Frontend setup
```sh
npm install
cp .env.example .env
```

### 7. Start the app
```sh
# Terminal 1: Laravel API (http://localhost:8000)
cd backend && php artisan serve

# Terminal 2: queue worker (emails, SMS, notifications)
cd backend && php artisan queue:work

# Terminal 3: frontend (http://localhost:8080)
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Laravel API | http://localhost:8000 |

## Environment variables

Never commit real secrets. Share them with your collaborator through a password manager, not Git.

**Backend (`backend/.env`)**
```env
APP_NAME=SafariConnect
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=safariconnect
DB_USERNAME=
DB_PASSWORD=

QUEUE_CONNECTION=database
FILESYSTEM_DISK=public

# Auth
JWT_SECRET=
JWT_TTL=60

# Mail (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="SafariConnect Kenya"

# IntaSend (M-Pesa STK Push)
INTASEND_PUBLISHABLE_KEY=
INTASEND_SECRET_KEY=
INTASEND_TEST_MODE=true

# Africa's Talking (SMS)
AT_USERNAME=
AT_API_KEY=

# Google
GOOGLE_MAPS_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Frontend (`.env`)**
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=
```

> Keep `INTASEND_TEST_MODE=true` locally. Only production should use live keys.

<!-- TODO (team): reconcile this list with the actual .env.example files. -->

## Project structure

<!-- Update to match the repo. Suggested layout: -->
```
.
├── src/                      # Frontend (TanStack Start + React)
│   ├── routes/               # File-based routes (public, customer, operator, admin)
│   ├── components/           # Reusable UI (shadcn/ui based)
│   ├── lib/                  # API client, utils, hooks
│   └── styles/
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/   # Auth, roles, throttling
│   │   │   └── Requests/     # Validation
│   │   ├── Models/
│   │   ├── Services/         # Leads, quotations, payments, notifications
│   │   ├── Jobs/             # Queued emails, SMS, PDFs
│   │   └── Policies/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/api.php
│   └── tests/
├── public/
└── README.md
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the frontend dev server (port 8080) |
| `npm run build` | Production frontend build |
| `npm run lint` | Lint the frontend |
| `php artisan serve` | Run the API locally (port 8000) |
| `php artisan queue:work` | Process queued jobs |
| `php artisan schedule:work` | Run the scheduler locally |
| `php artisan migrate` | Apply migrations |
| `php artisan migrate:fresh --seed` | Reset and reseed the DB (**local only**) |
| `php artisan route:list` | List API routes |
| `php artisan test` | Run backend tests |

<!-- Confirm against package.json and composer.json. -->

## Deployment

Target: Docker + Nginx (PHP-FPM) on a Linux server, HTTPS enabled, daily database backups.

- Run the frontend and backend as separate containers or services behind Nginx.
- Run a queue worker under Supervisor and add the scheduler cron entry:
  `* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1`
- On each deploy:
```sh
  composer install --no-dev --optimize-autoloader
  php artisan migrate --force
  php artisan config:cache && php artisan route:cache && php artisan view:cache
  php artisan queue:restart
```
- Production uses `APP_ENV=production`, `APP_DEBUG=false`, live IntaSend keys and the production SMTP account.
- Security checklist: HTTPS, role-based permissions, optional 2FA, rate limiting, CAPTCHA, encrypted sensitive data, audit logs, session management.

## Roadmap

Architecture is kept modular to support: hotels, airlines, travel insurance, car / boat hire, helicopter tours, event, conference, medical and volunteer tourism, travel agents, affiliate / referral / loyalty programs, mobile apps, AI trip planner and chat assistant, dynamic pricing, multi-language (Swahili next), and expansion to Uganda, Tanzania, Rwanda and Ethiopia.

## Non-functional goals

Modular codebase, documented REST APIs, structured logging and error handling, unit and integration tests, caching, lazy-loaded optimized images, dark / light mode, WCAG-friendly accessibility, SEO (clean URLs, meta tags, schema markup, Open Graph, sitemap, robots.txt).
