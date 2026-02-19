# Where to check logs (Nginx + Laravel on VPS)

Run these on the **VPS** (e.g. SSH into 144.217.162.167). Paths assume Ubuntu/Debian.

---

## 1. Nginx logs

Nginx writes to these by default (unless you set others in your server block):

| Log        | Path                         | Contents                    |
|-----------|------------------------------|-----------------------------|
| Access    | `/var/log/nginx/access.log`  | Every HTTP request (URL, status, IP, etc.) |
| Error     | `/var/log/nginx/error.log`  | Nginx errors (config, 502, timeouts, etc.) |

**View (last 50 lines):**
```bash
sudo tail -50 /var/log/nginx/access.log
sudo tail -50 /var/log/nginx/error.log
```

**Follow in real time:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Only errors from the last hour:**
```bash
sudo grep "$(date '+%Y/%m/%d %H')" /var/log/nginx/error.log
```

---

## 2. Laravel (application) logs

Your Laravel app logs to a single file:

| Log   | Path (on VPS)                          |
|-------|----------------------------------------|
| App   | `/var/www/mudancer/storage/logs/laravel.log` |

**View:**
```bash
sudo tail -100 /var/www/mudancer/storage/logs/laravel.log
```

**Follow:**
```bash
sudo tail -f /var/www/mudancer/storage/logs/laravel.log
```

Use this for PHP exceptions, `Log::info()`, `Log::error()`, and unhandled errors.

---

## 3. PHP-FPM logs

PHP-FPM logs its own errors (e.g. script crashes, timeouts):

| Log   | Typical path (Ubuntu)                    |
|-------|------------------------------------------|
| FPM   | `/var/log/php8.2-fpm.log` or `php-fpm.log` |

Sometimes it’s configured to go to the Nginx error log instead. Check:

```bash
ls -la /var/log/php*
# and in pool config:
grep -r "error_log\|access.log" /etc/php/*/fpm/pool.d/ 2>/dev/null
```

---

## 4. Quick reference

| What you want to check      | Command / file |
|-----------------------------|----------------|
| HTTP requests (URL, status) | `tail -f /var/log/nginx/access.log` |
| Nginx errors (502, config)  | `tail -f /var/log/nginx/error.log`  |
| Laravel errors & debug      | `tail -f /var/www/mudancer/storage/logs/laravel.log` |
| PHP-FPM errors              | `tail -f /var/log/php8.2-fpm.log` (path may vary)    |

---

## 5. Optional: per-site Nginx logs

To separate this site’s Nginx logs, in your server block (e.g. `/etc/nginx/sites-available/mudancer`) add:

```nginx
access_log /var/log/nginx/mudancer-access.log;
error_log  /var/log/nginx/mudancer-error.log;
```

Then reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`.
