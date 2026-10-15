# WorkForce Pro - Complete Laravel 13 Application

## 🎉 Full-Stack Laravel Application (No React!)

This is a **complete, production-ready Laravel 13 application** with:
- ✅ **Backend API** (RESTful endpoints)
- ✅ **Frontend** (Blade templates with Tailwind CSS)
- ✅ **Database** (38 tables with migrations)
- ✅ **Authentication** (Laravel Sanctum)
- ✅ **Real-time features** (Alpine.js)

---

## 📋 Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/              # API controllers (for mobile/external apps)
│   │   │   └── Web/              # Web controllers (for Blade views)
│   │   └── Middleware/
│   └── Models/                   # 20+ Eloquent models
├── database/
│   ├── migrations/               # 6 migration files (38 tables)
│   └── seeders/                  # DatabaseSeeder with sample data
├── resources/
│   └── views/                    # Blade templates
│       ├── layouts/
│       │   └── app.blade.php     # Main layout
│       ├── auth/
│       │   └── login.blade.php   # Login page
│       ├── dashboard.blade.php   # Admin dashboard
│       ├── employee/
│       │   └── dashboard.blade.php
│       ├── projects/
│       │   ├── index.blade.php
│       │   ├── show.blade.php
│       │   └── create.blade.php
│       └── ... (other views)
├── routes/
│   ├── web.php                   # Web routes (Blade views)
│   └── api.php                   # API routes (JSON)
├── config/
├── bootstrap/
├── .env.example
├── .gitignore
├── composer.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.3+
- MySQL 8.0+ or PostgreSQL 13+
- Redis 6.0+
- Composer 2.5+
- Node.js 18+ (optional, for asset compilation)

### Installation Steps

#### 1. Create Laravel 13 Project
```bash
composer create-project laravel/laravel workforce-pro "13.*"
cd workforce-pro
```

#### 2. Copy Backend Files
```bash
# Copy all files from this directory into your Laravel project
cp -r /path/to/backend/app/* app/
cp -r /path/to/backend/database/* database/
cp -r /path/to/backend/resources/* resources/
cp /path/to/backend/routes/web.php routes/
cp /path/to/backend/routes/api.php routes/
cp /path/to/backend/bootstrap/app.php bootstrap/
cp /path/to/backend/config/cors.php config/
cp /path/to/backend/.env.example .env
cp /path/to/backend/.gitignore .gitignore
cp /path/to/backend/composer.json composer.json
```

#### 3. Install Dependencies
```bash
composer install
composer require laravel/sanctum predis/predis
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

#### 4. Configure Environment
```bash
php artisan key:generate
```

Edit `.env`:
```env
APP_NAME="WorkForce Pro"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workforce_pro
DB_USERNAME=root
DB_PASSWORD=your_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
```

#### 5. Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE workforce_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 6. Run Migrations & Seeders
```bash
php artisan migrate
php artisan db:seed
```

#### 7. Start Development Server
```bash
php artisan serve
```

Visit: `http://localhost:8000`

---

## 🔐 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | suresh.nair | Suresh@123 |
| **Admin** | rajesh.kumar | Rajesh@123 |
| **Employee** | priya.sharma | Password@123 |
| **Employee** | amit.patel | Password@123 |
| **Employee** | sneha.reddy | Password@123 |
| **Employee** | ananya.gupta | Password@123 |

---

## 📊 Features

### For Admins
- ✅ Dashboard with metrics and charts
- ✅ Employee management (create, edit, activate/deactivate)
- ✅ Project management (create, edit, delete)
- ✅ Task management with status tracking
- ✅ Attendance tracking with auto check-in
- ✅ Leave management (approve/reject)
- ✅ Project chat with file attachments
- ✅ Reports and analytics
- ✅ Announcements
- ✅ Settings management

### For Employees
- ✅ Personal dashboard
- ✅ View assigned projects
- ✅ Daily task planner
- ✅ Attendance tracking
- ✅ Leave requests
- ✅ Project chat
- ✅ Work history

---

## 🎨 Frontend Technology

- **Blade Templates** - Laravel's native templating engine
- **Tailwind CSS** - Via CDN (no build step required)
- **Alpine.js** - For interactive components (dropdowns, modals)
- **Dark Mode** - Built-in theme toggle
- **Responsive Design** - Mobile-first approach

---

## 🔌 API Endpoints

The application also provides a complete REST API at `/api/*` for:
- Mobile apps
- Third-party integrations
- Headless frontend implementations

See `routes/api.php` for all endpoints.

---

## 📁 Key Files

### Routes
- `routes/web.php` - Web routes (Blade views)
- `routes/api.php` - API routes (JSON responses)

### Controllers
- `app/Http/Controllers/Web/` - Return Blade views
- `app/Http/Controllers/Api/` - Return JSON responses

### Views
- `resources/views/layouts/app.blade.php` - Main layout
- `resources/views/auth/login.blade.php` - Login page
- `resources/views/dashboard.blade.php` - Admin dashboard
- `resources/views/employee/dashboard.blade.php` - Employee dashboard
- `resources/views/projects/*.blade.php` - Project views
- And more...

### Models
- `app/Models/User.php` - User with relationships
- `app/Models/Project.php` - Project with tasks, members
- `app/Models/Task.php` - Task with status history
- And 17+ more models...

---

## 🗄️ Database Schema

38 tables covering:
- Users & Authentication
- Roles & Permissions
- Employees & Organizations
- Projects & Tasks
- Attendance & Leave
- Chat & Notifications
- Reports & Analytics

See `database/migrations/` for complete schema.

---

## 🚢 Deployment

### VPS Deployment (Ubuntu 22.04)

See `DEPLOYMENT.md` for complete guide including:
- Server setup
- Nginx configuration
- SSL certificates
- Queue workers
- Cron jobs
- Backups

### Quick Deploy
```bash
# On your VPS
cd /var/www
composer create-project laravel/laravel workforce-pro "13.*"
cd workforce-pro

# Copy files and configure
# (see DEPLOYMENT.md for details)

php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
```

---

## 🧪 Testing

### Test Web Interface
1. Visit `http://localhost:8000`
2. Login with admin credentials
3. Navigate through all pages
4. Create a project, add tasks, send messages

### Test API
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"suresh.nair","password":"Suresh@123"}'

# Get dashboard
curl -X GET http://localhost:8000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Documentation

- **[README.md](README.md)** - This file
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - VPS deployment guide
- **[UPGRADE_TO_LARAVEL_13.md](UPGRADE_TO_LARAVEL_13.md)** - Laravel 13 features
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details

---

## 🛠️ Tech Stack

- **Framework**: Laravel 13
- **PHP**: 8.3+
- **Database**: MySQL 8.0+ / PostgreSQL 13+
- **Cache/Queue**: Redis 6.0+
- **Frontend**: Blade + Tailwind CSS + Alpine.js
- **Authentication**: Laravel Sanctum
- **API**: RESTful JSON API

---

## 📝 Notes

- No React or Node.js build process required
- Tailwind CSS loaded via CDN (no compilation needed)
- Alpine.js for interactivity (no build step)
- Dark mode support built-in
- Fully responsive design
- Production-ready code

---

## 🎯 Next Steps

1. ✅ Install Laravel 13
2. ✅ Copy backend files
3. ✅ Configure database
4. ✅ Run migrations
5. ✅ Seed database
6. ✅ Start server
7. ✅ Login and explore!

---

## 🆘 Support

For issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Enable debug mode: `APP_DEBUG=true` in `.env`
3. Clear caches: `php artisan config:clear && php artisan cache:clear`
4. Check database connection in `.env`

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

**Your complete Laravel application is ready!** 🚀

No React, no Node.js build process - just pure Laravel with Blade templates!
