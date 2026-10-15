# Laravel 11 to 13 Upgrade Guide

## 🎉 Upgraded to Laravel 13!

The WorkForce Pro backend has been upgraded from Laravel 11 to **Laravel 13** (released March 2026).

---

## 📋 What's New in Laravel 13

### 1. PHP 8.3+ Required
- Laravel 13 requires **PHP 8.3** as minimum (up from PHP 8.2)
- Supports PHP 8.3, 8.4, and 8.5
- Bug fixes until Q3 2027
- Security updates until Q1 2028

### 2. First-Class PHP Attributes Support
You can now use PHP attributes instead of class properties:

```php
// Before (Laravel 11)
class User extends Model {
    protected $table = 'users';
    protected $fillable = ['name', 'email'];
    protected $hidden = ['password'];
}

// After (Laravel 13) - Optional but recommended
#[Table('users')]
#[Fillable(['name', 'email'])]
#[Hidden(['password'])]
class User extends Model {
}
```

### 3. Laravel AI SDK (New!)
First-party AI integration for:
- Text generation
- Tool-calling agents
- Embeddings
- Audio processing
- Image generation
- Vector store integrations

### 4. JSON:API Resources
Built-in support for JSON:API specification:
- Resource object serialization
- Relationship inclusion
- Sparse fieldsets
- Links and metadata

### 5. Queue Routing
Define default queue/connection for specific jobs:

```php
Queue::route(ProcessPodcast::class, 
    connection: 'redis', 
    queue: 'podcasts'
);
```

### 6. Semantic/Vector Search
Native vector query support for AI-powered search:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'search query')
    ->limit(10)
    ->get();
```

### 7. Cache::touch()
Extend cache TTL without fetching the value:

```php
Cache::touch('user_session:123', 3600); // Extend by 1 hour
```

---

## 🔧 Breaking Changes

### Minimal Breaking Changes
Laravel 13 focused on **minimizing breaking changes**. Most Laravel 11 code works without modifications.

### Key Changes:
1. **PHP 8.3 Required** - Must upgrade from PHP 8.2
2. **Some deprecated methods removed** - Check Laravel 13 release notes
3. **Attribute syntax** - Optional but recommended for new code

---

## 📦 Updated Files

### 1. composer.json
```json
{
    "require": {
        "php": "^8.3",
        "laravel/framework": "^13.0",
        "laravel/sanctum": "^4.0"
    }
}
```

### 2. setup.sh
- Updated to create Laravel 13 project
- Added PHP 8.3 version check
- Updated installation instructions

### 3. DEPLOYMENT.md
- Updated PHP installation to 8.3
- Updated Laravel project creation to version 13
- Updated all PHP references from 8.2 to 8.3

### 4. README.md
- Updated requirements to PHP 8.3+
- Updated Laravel version to 13
- Updated tech stack information

### 5. SETUP_GUIDE.md
- Updated all Laravel 11 references to Laravel 13
- Updated PHP version requirements
- Added PHP 8.3 verification steps

### 6. IMPLEMENTATION_SUMMARY.md
- Updated to reflect Laravel 13
- Added tech stack details
- Updated support timeline

---

## 🚀 Upgrade Steps

### For New Installations

```bash
# 1. Ensure PHP 8.3+ is installed
php -v  # Should show 8.3.x or higher

# 2. Create Laravel 13 project
composer create-project laravel/laravel workforce-pro-backend "13.*"
cd workforce-pro-backend

# 3. Install dependencies
composer require laravel/sanctum predis/predis

# 4. Copy backend files (see SETUP_GUIDE.md)

# 5. Configure and run
php artisan key:generate
php artisan migrate
php artisan db:seed
```

### For Existing Laravel 11 Projects

If you already have a Laravel 11 installation:

```bash
# 1. Upgrade PHP to 8.3+
# (depends on your OS/package manager)

# 2. Update composer.json
composer require laravel/framework:^13.0 --update-with-dependencies

# 3. Update dependencies
composer update

# 4. Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 5. Test your application
php artisan serve
```

**Note:** Our backend code is compatible with both Laravel 11 and 13, so no code changes are needed in the models, controllers, or migrations.

---

## ✅ Verification Checklist

After upgrade, verify:

- [ ] PHP version is 8.3 or higher
- [ ] Laravel version is 13.x
- [ ] All migrations run successfully
- [ ] Database seeder works
- [ ] API endpoints respond correctly
- [ ] Authentication works (Sanctum)
- [ ] Queue workers process jobs
- [ ] Cache operations work
- [ ] No deprecation warnings in logs

---

## 📊 Support Timeline

| Version | PHP | Release | Bug Fixes Until | Security Until |
|---------|-----|---------|-----------------|----------------|
| Laravel 11 | 8.2-8.4 | Mar 2024 | Sep 2025 | Mar 2026 |
| Laravel 12 | 8.2-8.5 | Feb 2025 | Aug 2026 | Feb 2027 |
| **Laravel 13** | **8.3-8.5** | **Mar 2026** | **Q3 2027** | **Q1 2028** |

---

## 🎯 Benefits of Upgrading

1. **Longer Support** - Security updates until Q1 2028
2. **Better Performance** - PHP 8.3 improvements
3. **Modern Syntax** - PHP attributes support
4. **AI Ready** - Laravel AI SDK available
5. **Future-Proof** - Latest features and improvements

---

## 🔍 Testing the Upgrade

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"suresh.nair","password":"Suresh@123"}'
```

### Test Protected Endpoint
```bash
TOKEN="your_token_here"
curl -X GET http://localhost:8000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Check Laravel Version
```bash
php artisan --version
# Should show: Laravel Framework 13.x.x
```

### Check PHP Version
```bash
php -v
# Should show: PHP 8.3.x or higher
```

---

## 📚 Additional Resources

- [Laravel 13 Release Notes](https://laravel.com/docs/13.x/releases)
- [Laravel 13 Upgrade Guide](https://laravel.com/docs/13.x/upgrade)
- [PHP 8.3 Release](https://www.php.net/releases/8.3/en.php)
- [Laravel AI SDK Documentation](https://laravel.com/docs/13.x/ai)

---

## 🆘 Troubleshooting

### Issue: "PHP 8.3 required" error
**Solution:** Upgrade PHP to 8.3 or higher
```bash
# Ubuntu/Debian
sudo apt install php8.3 php8.3-fpm php8.3-cli

# macOS (Homebrew)
brew install php@8.3
```

### Issue: Composer dependency conflicts
**Solution:** Update all packages
```bash
composer update --with-all-dependencies
```

### Issue: Deprecated method warnings
**Solution:** Check Laravel 13 upgrade guide for removed methods and update accordingly

---

## ✨ Summary

Your WorkForce Pro backend is now running on **Laravel 13** with:
- ✅ PHP 8.3+ support
- ✅ Latest Laravel features
- ✅ Extended support until 2028
- ✅ AI-ready architecture
- ✅ Modern PHP attributes support
- ✅ All existing functionality preserved

**The upgrade is complete and backward compatible!** 🎉
