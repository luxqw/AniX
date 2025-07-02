# AniX Application Deployment

## Docker

Requirements:

- [docker](https://docs.docker.com/engine/install/)

### Quick Deployment with Docker Compose (recommended)

> [!TIP]
> This is the easiest way to deploy with HTTPS, SSL support, and production-ready configuration.

#### Basic deployment without SSL

1. Clone the repository:
```bash
git clone https://github.com/luxqw/AniX
cd AniX
```

2. Start deployment:
```bash
make prod
# or
./scripts/deploy.sh --skip-ssl
```

The application will be available at: `http://localhost`

#### Deployment with SSL and custom domain

1. Clone the repository:
```bash
git clone https://github.com/luxqw/AniX
cd AniX
```

2. Start deployment with SSL:
```bash
make prod DOMAIN=your-domain.com EMAIL=your@email.com
# or
./scripts/deploy.sh --domain your-domain.com --email your@email.com
```

The application will be available at: `https://your-domain.com`

#### Development

For development use:
```bash
make dev
# or
./scripts/dev.sh
```

The application will be available at: `http://localhost:3000`

### Useful commands

```bash
# View logs
make logs

# Stop application
make down

# Renew SSL certificates
make ssl-renew

# Clean Docker resources
make clean

# Show help
make help
```

### Environment variables

To use your own parser, create a `.env` file with the following variables:

```bash
NEXT_PUBLIC_KODIK_PARSER_URL=your_url
NEXT_PUBLIC_ANILIBRIA_PARSER_URL=your_url
NEXT_PUBLIC_SIBNET_PARSER_URL=your_url
```

✅ **Nginx reverse proxy** with performance optimization

✅ **Automatic SSL** via Let's Encrypt

✅ **Static file caching** for fast loading

✅ **Gzip compression** for traffic savings

✅ **Security headers** for protection against attacks

✅ **Automatic certificate renewal**

✅ **Production-ready configuration**


### docker/Architecture

```
Internet → Nginx (ports 80/443) → Next.js application (port 3000)
                ↓
            SSL certificates
            Caching
            Compression
            Security
```
