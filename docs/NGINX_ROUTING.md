# Nginx Routing Architecture & Configuration Guide

This guide details the Nginx reverse proxy architecture that sits in front of the headless WordPress PHP-FPM service.

---

## 1. Nginx Role in the Headless WordPress Stack

In our backend setup, WordPress runs on the official `wordpress:php8.2-fpm-alpine` image. PHP-FPM (FastCGI Process Manager) handles PHP execution but does **not** speak HTTP directly or serve static files (CSS, JS, images, media uploads).

Nginx acts as the high-performance HTTP gateway:
1. Receives incoming browser and internal container HTTP traffic on port 80.
2. Directly serves static files (`.js`, `.css`, `.png`, `.jpg`, `.svg`) from the shared `wp_data` volume without invoking PHP.
3. Forwards dynamic requests (`index.php`, GraphQL endpoints, REST API, `/wp-admin/`) via FastCGI protocol to `wordpress:9000`.
4. Exposes a lightweight `/healthz` endpoint returning HTTP 200 for health checks.
5. Implements security rules blocking direct execution of uploaded PHP files and hidden dotfiles.

---

## 2. Configuration Breakdown (`nginx/default.conf`)

```nginx
server {
    listen 80;
    server_name localhost local.blfa.com;
    root /var/www/html;
    index index.php index.html;

    client_max_body_size 64M;

    # 1. Health check endpoint (bypasses PHP and logging)
    location /healthz {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 2. Block access to hidden files (.git, .env, .htaccess)
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 3. Security: Prevent PHP execution inside WordPress uploads directory
    location ~* /(?:uploads|files)/.*\.php$ {
        deny all;
    }

    # 4. Standard WordPress front-controller pattern
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # 5. FastCGI PHP processing via upstream WordPress service
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass wordpress:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_param HTTP_HOST $http_host;
        fastcgi_read_timeout 300;
    }

    # 6. Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires max;
        log_not_found off;
    }
}
```

---

## 3. Container Ports & Upstream Mapping

- **Host Port**: `9000` (mapped via Docker Compose `9000:80`).
- **Nginx Container Port**: `80` (listens for standard HTTP traffic).
- **Upstream WordPress Hostname**: `wordpress` (resolved through Docker DNS on `blfa-network`).
- **Upstream WordPress Port**: `9000` (standard PHP-FPM listening port inside the WordPress container).

---

## 4. Validating Nginx Configuration

To test that your Nginx configuration syntax is valid without restarting the container:

```bash
# Execute nginx syntax check inside the running container
docker compose exec nginx nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

To reload configuration changes without downtime:
```bash
docker compose exec nginx nginx -s reload
```

To verify the `/healthz` endpoint:
```bash
curl -i http://localhost:9000/healthz
```

**Expected response:**
```http
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 8

healthy
```
