# VPS Deployment Guide - WorkForce Pro Laravel Backend

Complete guide to deploy the Laravel backend on a VPS server (Ubuntu 22.04 LTS recommended).

---

## 📋 Prerequisites

- VPS with Ubuntu 22.04 LTS (minimum 2GB RAM, 2 CPU cores, 40GB storage)
- Domain name pointed to your VPS IP
- SSH access to the server
- Basic Linux command line knowledge

---

## 🚀 Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget unzip git software-properties-common
```

### 1.2 Install PHP 8.3
```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3 php8.3-fpm php8.3-cli php8.3-common \
    php8.3-mysql php8.3-pgsql php8.3-zip php8.3-gd php8.3-mbstring \
    php8.3-curl php8.3-xml php8.3-bcmath php8.3-tokenizer php8.3-soap \
    php8.3-intl php8.3-redis
```

Verify PHP installation:
```bash
php -v
```

### 1.3 Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### 1.4 Install MySQL 8.0
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Secure MySQL:
```bash
sudo mysql_secure_installation
```

Create database and user:
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE workforce_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'workforce_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON workforce_pro.* TO 'workforce_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.5 Install Redis
```bash
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### 1.6 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 Step 2: Deploy Application

### 2.1 Create Application Directory
```bash
sudo mkdir -p /var/www/workforce-pro
sudo chown -R $USER:$USER /var/www/workforce-pro
cd /var/www/workforce-pro
```

### 2.2 Create Laravel 13 Project
```bash
composer create-project laravel/laravel api "13.*"
cd api
```

### 2.3 Copy Backend Files
Copy all files from the `backend/` directory into `/var/www/workforce-pro/api/`:

```bash
# From your local machine
scp -r backend/database/migrations/* user@your-server:/var/www/workforce-pro/api/database/migrations/
scp -r backend/app/Models/* user@your-server:/var/www/workforce-pro/api/app/Models/
scp -r backend/app/Http/Controllers/* user@your-server:/var/www/workforce-pro/api/app/Http/Controllers/
scp backend/routes/api.php user@your-server:/var/www/workforce-pro/api/routes/
scp backend/database/seeders/DatabaseSeeder.php user@your-server:/var/www/workforce-pro/api/database/seeders/
scp backend/.env.example user@your-server:/var/www/workforce-pro/api/.env
```

### 2.4 Install Dependencies
```bash
cd /var/www/workforce-pro/api
composer install --optimize-autoloader --no-dev
```

### 2.5 Install Sanctum
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 2.6 Configure Environment
```bash
nano .env
```

Update these values:
```env
APP_NAME="WorkForce Pro"
APP_ENV=production
APP_KEY=  # Will be generated next
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workforce_pro
DB_USERNAME=workforce_user
DB_PASSWORD=YourStrongPassword123!

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

Generate app key:
```bash
php artisan key:generate
```

### 2.7 Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/workforce-pro/api
sudo chmod -R 755 /var/www/workforce-pro/api
sudo chmod -R 775 /var/www/workforce-pro/api/storage
sudo chmod -R 775 /var/www/workforce-pro/api/bootstrap/cache
```

### 2.8 Run Migrations
```bash
php artisan migrate --force
```

### 2.9 Seed Database
```bash
php artisan db:seed --force
```

This creates:
- Admin user: `suresh.nair` / `Suresh@123`
- PM user: `rajesh.kumar` / `Rajesh@123`
- Employee users: `priya.sharma`, `amit.patel`, `sneha.reddy`, `ananya.gupta` / `Password@123`

---

## 🌐 Step 3: Configure Nginx

### 3.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/workforce-pro
```

Add this configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;
    root /var/www/workforce-pro/api/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/workforce-pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.2 Install SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Follow the prompts to complete SSL setup.

---

## ⚙️ Step 4: Configure Queue & Scheduler

### 4.1 Create Supervisor Configuration
```bash
sudo apt install -y supervisor
sudo nano /etc/supervisor/conf.d/workforce-pro-queue.conf
```

Add:
```ini
[program:workforce-pro-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/workforce-pro/api/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/workforce-pro/api/storage/logs/queue-worker.log
stopwaitsecs=3600
```

Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start workforce-pro-queue:*
```

### 4.2 Setup Cron Scheduler
```bash
crontab -e
```

Add this line:
```cron
* * * * * cd /var/www/workforce-pro/api && php artisan schedule:run >> /dev/null 2>&1
```

### 4.3 Create Scheduled Tasks
Create `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule)
{
    // Generate daily reports at 6:30 PM
    $schedule->command('reports:generate-daily')
             ->dailyAt('18:30')
             ->timezone('Asia/Kolkata');

    // Send reminder notifications
    $schedule->command('notifications:send-reminders')
             ->everyThirtyMinutes();

    // Check for upcoming birthdays/anniversaries
    $schedule->command('notifications:check-upcoming')
             ->dailyAt('08:00')
             ->timezone('Asia/Kolkata');

    // Cleanup old activity logs (keep 90 days)
    $schedule->command('activity-logs:cleanup --days=90')
             ->weekly();
}
```

---

## 🔒 Step 5: Security Hardening

### 5.1 Configure Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 5.2 Secure MySQL
```bash
sudo mysql -u root -p
```

```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';
-- Remove remote root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
-- Remove test database
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
```

### 5.3 PHP Security
Edit `/etc/php/8.2/fpm/php.ini`:
```ini
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
max_execution_time = 60
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 10M
```

Restart PHP-FPM:
```bash
sudo systemctl restart php8.2-fpm
```

---

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/workforce-pro
```

Add:
```
/var/www/workforce-pro/api/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload php8.2-fpm
    endscript
}
```

### 6.2 Setup Automated Backups
```bash
sudo nano /usr/local/bin/workforce-backup.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/workforce-pro"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u workforce_user -p'YourStrongPassword123!' workforce_pro | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/workforce-pro/api/storage/app

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/workforce-backup.sh
crontab -e
```

Add daily backup at 2 AM:
```cron
0 2 * * * /usr/local/bin/workforce-backup.sh
```

### 6.3 Monitoring Commands
```bash
# Check queue worker status
sudo supervisorctl status

# View Laravel logs
tail -f /var/www/workforce-pro/api/storage/logs/laravel.log

# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Monitor Redis
redis-cli info

# Check database connections
mysql -u workforce_user -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

---

## 🔄 Step 7: Deployment Updates

### 7.1 Create Deployment Script
```bash
nano /usr/local/bin/deploy-workforce.sh
```

Add:
```bash
#!/bin/bash
cd /var/www/workforce-pro/api

# Pull latest code (if using git)
# git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
sudo supervisorctl restart workforce-pro-queue:*

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache

echo "Deployment completed successfully!"
```

```bash
sudo chmod +x /usr/local/bin/deploy-workforce.sh
```

### 7.2 Deploy New Version
```bash
/usr/local/bin/deploy-workforce.sh
```

---

## 🧪 Step 8: Testing

### 8.1 Test API Endpoints
```bash
# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"suresh.nair","password":"Suresh@123"}'

# Test with token
TOKEN="your_token_here"
curl -X GET https://api.yourdomain.com/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### 8.2 Health Check
Create `routes/api.php` health endpoint:
```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'version' => config('app.version'),
    ]);
});
```

---

## 📝 Troubleshooting

### Common Issues

**1. 500 Internal Server Error**
```bash
# Check Laravel logs
tail -f /var/www/workforce-pro/api/storage/logs/laravel.log

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Fix permissions
sudo chown -R www-data:www-data /var/www/workforce-pro/api
sudo chmod -R 775 /var/www/workforce-pro/api/storage
```

**2. Queue Not Processing**
```bash
# Check supervisor status
sudo supervisorctl status

# Restart queue workers
sudo supervisorctl restart workforce-pro-queue:*

# Check queue logs
tail -f /var/www/workforce-pro/api/storage/logs/queue-worker.log
```

**3. Database Connection Error**
```bash
# Test MySQL connection
mysql -u workforce_user -p workforce_pro

# Check .env database credentials
cat /var/www/workforce-pro/api/.env | grep DB_
```

**4. Redis Connection Error**
```bash
# Check Redis status
sudo systemctl status redis

# Test Redis connection
redis-cli ping
```

---

## 📚 Additional Resources

- [Laravel Deployment Documentation](https://laravel.com/docs/10.x/deployment)
- [Laravel Sanctum Documentation](https://laravel.com/docs/10.x/sanctum)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Supervisor Documentation](http://supervisord.org/)

---

## ✅ Deployment Checklist

- [ ] Server updated and secured
- [ ] PHP 8.2 installed with all extensions
- [ ] MySQL configured with database and user
- [ ] Redis installed and running
- [ ] Nginx configured with SSL
- [ ] Laravel application deployed
- [ ] Environment variables configured
- [ ] Migrations run successfully
- [ ] Database seeded with initial data
- [ ] Queue workers running via Supervisor
- [ ] Cron scheduler configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring in place
- [ ] API endpoints tested
- [ ] Frontend connected to API

---

## 🎯 Post-Deployment

After successful deployment:

1. **Update Frontend**: Point your React frontend to `https://api.yourdomain.com/api`
2. **Test All Features**: Login, create projects, add tasks, chat, etc.
3. **Monitor Logs**: Watch for any errors in the first 24 hours
4. **Performance Testing**: Load test with expected user count
5. **Backup Test**: Verify backup restoration works

---

**Your WorkForce Pro backend is now live and production-ready!** 🚀
