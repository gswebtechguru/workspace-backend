# WorkForce Pro - Laravel 13 Backend

## Complete Backend API with Database Migrations

This directory contains the full Laravel 13 backend for the WorkForce Pro Employee & Project Management System.

**Requirements:**
- PHP 8.3+ (required for Laravel 13)
- MySQL 8.0+ or PostgreSQL 13+
- Redis 6.0+
- Composer 2.5+

## 📁 Structure

```
backend/
├── database/
│   └── migrations/          # All database migrations
├── app/
│   ├── Models/              # Eloquent models with relationships
│   └── Http/
│       ├── Controllers/
│       │   └── Api/         # API controllers
│       ├── Middleware/      # Custom middleware
│       └── Requests/        # Form requests
├── routes/
│   └── api.php              # API routes
├── config/                  # Configuration files
├── DEPLOYMENT.md            # VPS deployment guide
└── README.md                # Setup instructions
```

## 🚀 Quick Start

```bash
# 1. Create Laravel project
composer create-project laravel/laravel workforce-pro-api

# 2. Copy files from this directory into the Laravel project

# 3. Install dependencies
composer require laravel/sanctum
php artisan sanctum:install

# 4. Configure .env
cp .env.example .env
php artisan key:generate

# 5. Run migrations
php artisan migrate

# 6. Seed data
php artisan db:seed

# 7. Start server
php artisan serve
```

## 📋 API Endpoints

See `routes/api.php` for complete endpoint list.

## 🔐 Authentication

Uses Laravel Sanctum for token-based authentication.

## 📦 Deployment

See `DEPLOYMENT.md` for complete VPS deployment guide.
