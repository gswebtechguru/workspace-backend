#!/bin/bash

# WorkForce Pro - Laravel 11 Backend Setup Script
# Run this script to set up the complete backend

echo "🚀 Setting up WorkForce Pro Laravel 11 Backend..."
echo ""

# Step 1: Create Laravel 11 project
echo "📦 Creating Laravel 11 project..."
composer create-project laravel/laravel workforce-pro-backend "11.*"
cd workforce-pro-backend

# Step 2: Install required packages
echo "📦 Installing required packages..."
composer require laravel/sanctum
composer require predis/predis

# Step 3: Publish Sanctum configuration
echo "⚙️ Publishing Sanctum configuration..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Step 4: Copy backend files
echo "📋 Copying backend files..."
echo "Please copy the following files from the backend/ directory:"
echo "  - database/migrations/* → database/migrations/"
echo "  - app/Models/* → app/Models/"
echo "  - app/Http/Controllers/Api/* → app/Http/Controllers/Api/"
echo "  - routes/api.php → routes/api.php"
echo "  - database/seeders/DatabaseSeeder.php → database/seeders/DatabaseSeeder.php"
echo "  - bootstrap/app.php → bootstrap/app.php"
echo "  - config/cors.php → config/cors.php"
echo "  - .env.example → .env"
echo ""
read -p "Press Enter after copying files..."

# Step 5: Configure environment
echo "⚙️ Configuring environment..."
php artisan key:generate

echo ""
echo "📝 Please edit .env file with your database credentials:"
echo "  DB_DATABASE=workforce_pro"
echo "  DB_USERNAME=your_username"
echo "  DB_PASSWORD=your_password"
echo ""
read -p "Press Enter after configuring .env..."

# Step 6: Create database (if MySQL is local)
echo "🗄️ Creating database..."
read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASSWORD
echo ""
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS workforce_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "✅ Database created"

# Step 7: Run migrations
echo "🗄️ Running migrations..."
php artisan migrate --force

# Step 8: Seed database
echo "🌱 Seeding database..."
php artisan db:seed --force

# Step 9: Set permissions
echo "🔐 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 storage/app storage/framework storage/logs

# Step 10: Optimize
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Default credentials:"
echo "  Admin: suresh.nair / Suresh@123"
echo "  PM: rajesh.kumar / Rajesh@123"
echo "  Employee: priya.sharma / Password@123"
echo ""
echo "🚀 Start the development server:"
echo "  php artisan serve"
echo ""
echo "📖 API will be available at: http://localhost:8000/api"
echo ""
echo "📚 Next steps:"
echo "  1. Test API endpoints"
echo "  2. Connect your React frontend"
echo "  3. Deploy to VPS (see DEPLOYMENT.md)"
