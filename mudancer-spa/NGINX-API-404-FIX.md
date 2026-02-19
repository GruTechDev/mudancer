# Fix: 404 on /api/* (Nginx not passing to Laravel)

If `GET http://144.217.162.167/api/admin/providers` returns **404** with **Content-Type: text/html** and **Server: nginx**, Nginx is serving its own 404 and **not** passing the request to Laravel.

## 1. Update Nginx config on the VPS

SSH into the VPS and edit the site config:

```bash
sudo nano /etc/nginx/sites-available/mudancer
```

Use the contents of **`nginx-mudancer.conf`** from this repo. Important points:

- Use **`location ^~ /api`** (not just `location /api`) so this block always wins and Nginx does not try to serve files under `/api`.
- **Do not** put `try_files` inside the `/api` block — pass straight to PHP-FPM.
- **PHP-FPM socket:** use `unix:/run/php/php-fpm.sock` or `unix:/run/php/php8.3-fpm.sock` to match your PHP version.

Example block that must be present:

```nginx
location ^~ /api {
    fastcgi_pass unix:/run/php/php-fpm.sock;
    fastcgi_param SCRIPT_FILENAME /var/www/mudancer/public/index.php;
    fastcgi_param SCRIPT_NAME /index.php;
    fastcgi_param REQUEST_URI $request_uri;
    include fastcgi_params;
    fastcgi_read_timeout 60;
}
```

Paths must match your server:

- Laravel app: `/var/www/mudancer`
- Laravel entry: `/var/www/mudancer/public/index.php`

## 2. Check which config is active

Ensure the right server block is used for this site:

```bash
sudo nginx -T | grep -A2 "server_name 144.217.162.167"
```

Confirm the same file contains the `location ^~ /api` block. If you use a default site, disable it so it doesn’t catch the request:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

## 3. Test and reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Confirm PHP-FPM is running

```bash
sudo systemctl status php8.2-fpm
# or: sudo systemctl status php-fpm
```

If the socket path in Nginx differs (e.g. `php8.3-fpm.sock`), fix it in the config and reload Nginx again.

## 5. Optional: test Laravel directly

On the VPS:

```bash
cd /var/www/mudancer
php artisan route:list --path=api
```

You should see `GET api/admin/providers`. Then:

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/admin/providers
```

If Nginx is correct, this should return `200` (or `302`/`500`, but not `404`). A `404` here means the request is still not reaching Laravel.

After these steps, `/api/*` should be handled by Laravel and the 404 from Nginx should stop.
