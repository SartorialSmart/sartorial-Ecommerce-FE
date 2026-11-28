# Vercel → DigitalOcean migration checklist

Target layout on the droplet: `nginx (TLS) → Nitro node server :3000` for the
storefront, and `nginx (TLS) → gunicorn unix socket` for the Django API, both
backed by local Postgres and Redis with Celery worker + beat as systemd units.

## 1. Front-end code/config (repo `sartorial-Ecommerce-FE`)

- [x] `vite.config.ts`: `nitro({ preset: "node" })` instead of `"vercel"`.
      Build output is now `.output/` (`.output/server/index.mjs` +
      `.output/public/`), not `.vercel/output/` or `dist/`.
- [x] `.github/workflows/deploy.yml`: build on GitHub Actions, inject `VITE_*`
      at build time, copy `.output/` to the droplet, restart the service.
- [x] `deploy/frontend.service`, `deploy/nginx.conf`, `deploy/deploy.sh` added.
- [ ] Delete the Vercel project (after DNS switchover and a smoke test).

`VITE_*` values are compiled into the browser bundle, so they must exist at
**build** time — setting them only on the server at runtime has no effect.

| Variable | Required | Production value |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | `https://<api-domain>/api/v1` (include the `/api/v1` suffix) |
| `VITE_TENANT_SLUG` | No | Leave empty for the backend's default tenant |

## 2. Backend (repo `sartorial-Ecommerce-BE`)

The production settings module is already VM-oriented (`config.settings.prod`);
nothing in code needs changing. Remove every `VERCEL*` variable from the server
`.env` and set:

```env
DJANGO_SETTINGS_MODULE=config.settings.prod
DJANGO_SECRET_KEY=<50+ random chars>
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=<api-domain>,<droplet-ip>
DJANGO_CSRF_TRUSTED_ORIGINS=https://<api-domain>
DJANGO_SECURE_SSL_REDIRECT=1
API_PUBLIC_BASE_URL=https://<api-domain>
FRONTEND_BASE_URL=https://<storefront-domain>
CORS_ALLOWED_ORIGINS=https://<storefront-domain>
POSTGRES_HOST=localhost
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0
CELERY_TASK_ALWAYS_EAGER=false
CRON_SECRET=<random token>
```
See `deploy/ENVIRONMENTS.md` in the backend repo for the full production list.
`prod.py` no longer gets `VERCEL_URL` injected, so `DJANGO_ALLOWED_HOSTS` and
`DJANGO_CSRF_TRUSTED_ORIGINS` become authoritative.

## 3. One-time droplet provisioning (as root)

```bash
apt-get update && apt-get install -y nginx certbot python3-certbot-nginx
# Node 24 is required by the Nitro build output (NodeSource or nvm):
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs
node --version   # must be 24.x

install -d -o prime -g www-data /home/prime/sartorial-Ecommerce-FE
cp deploy/frontend.service /etc/systemd/system/sartorial-ecommerce-fe.service
cp deploy/nginx.conf /etc/nginx/sites-available/sartorial-ecommerce-fe
ln -sf /etc/nginx/sites-available/sartorial-ecommerce-fe /etc/nginx/sites-enabled/
sed -i 's/shop.example.com/<storefront-domain>/g' /etc/nginx/sites-available/sartorial-ecommerce-fe
nginx -t && systemctl reload nginx
certbot --nginx -d <storefront-domain> --non-interactive --agree-tos -m <email>

install -m 0440 /dev/stdin /etc/sudoers.d/prime-frontend <<'EOF'
prime ALL=(root) NOPASSWD: /usr/bin/systemctl restart sartorial-ecommerce-fe, /usr/bin/systemctl is-active sartorial-ecommerce-fe
EOF
systemctl daemon-reload
systemctl enable sartorial-ecommerce-fe
```
The backend's equivalent services (`gunicorn`, `celery-worker`, `celery-beat`),
Postgres and Redis are provisioned per `sartorial-Ecommerce-BE/deploy/README.md`.

## 4. GitHub configuration

**Repo `sartorial-Ecommerce-FE` → Settings → Secrets and variables → Actions**

| Kind | Name | Value |
|---|---|---|
| Secret | `SERVER_IP` | droplet IPv4 address |
| Secret | `SSH_KEY` | private deploy key (public key in `~prime/.ssh/authorized_keys`) |
| Secret | `VITE_API_BASE_URL` | `https://<api-domain>/api/v1` |
| Secret | `VITE_TENANT_SLUG` | blank or a slug |
| Variable | `DEPLOY_USER` | `prime` (override if your deploy key maps to another user) |
| Variable | `FE_APP_DIR` | `/home/prime/sartorial-Ecommerce-FE` |

**Repo `sartorial-Ecommerce-BE`**

| Secret | Value |
|---|---|
| `SERVER_IP`, `SSH_KEY` | same droplet/key |
| `API_BASE_URL` | `https://<api-domain>` (no trailing slash) |
| `CRON_SECRET` | same value as the backend `.env` |

Vercel Cron disappears with the Vercel project. Recurring jobs are covered by
Celery Beat on the droplet; the `cron.yml` GitHub workflow is the backstop and
needs `API_BASE_URL` + `CRON_SECRET`.

## 5. Cutover and verification

- [ ] Point DNS for `<api-domain>` and `<storefront-domain>` at the droplet.
- [ ] TLS certificates issued for both domains; `certbot renew --dry-run` passes.
- [ ] `curl -I https://<api-domain>/health/` (or an API endpoint) returns 200.
- [ ] `curl -I https://<storefront-domain>/` returns 200 and rendered HTML.
- [ ] Browser: signup/login → catalogue → cart → checkout → payment webhook.
- [ ] Backend: `sudo systemctl is-active gunicorn celery-worker celery-beat`.
- [ ] Frontend: `sudo systemctl is-active sartorial-ecommerce-fe`.
- [ ] Confirm scheduled jobs fire (`/api/v1/cron/run/` with `CRON_SECRET`).
- [ ] Rollback: keep the last known-good `.output/` and backend `.env` copy;
      restore them and restart the services if a deploy breaks production.
