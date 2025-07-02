# Развёртывание приложения AniX

## Docker

Требования:

- [docker](https://docs.docker.com/engine/install/)

### Быстрое развертывание с Docker Compose (рекомендуется)

> [!TIP]
> Это самый простой способ развертывания с поддержкой HTTPS, SSL и production-ready конфигурацией.

#### Базовое развертывание без SSL

1. Клонируйте репозиторий:
```bash
git clone https://github.com/luxqw/AniX
cd AniX
```

2. Запустите развертывание:
```bash
make prod
# или
./scripts/deploy.sh --skip-ssl
```

Приложение будет доступно по адресу: `http://localhost`

#### Развертывание с SSL и собственным доменом

1. Клонируйте репозиторий:
```bash
git clone https://github.com/luxqw/AniX
cd AniX
```

2. Запустите развертывание с SSL:
```bash
make prod DOMAIN=ваш-домен.com EMAIL=ваш@email.com
# или
./scripts/deploy.sh --domain ваш-домен.com --email ваш@email.com
```

Приложение будет доступно по адресу: `https://ваш-домен.com`

#### Разработка

Для разработки используйте:
```bash
make dev
# или
./scripts/dev.sh
```

Приложение будет доступно по адресу: `http://localhost:3000`

### Полезные команды

```bash
# Просмотр логов
make logs

# Остановка приложения
make down

# Обновление SSL сертификатов
make ssl-renew

# Очистка Docker ресурсов
make clean

# Показать помощь
make help
```

### Переменные окружения

Для использования собственного парсера создайте файл `.env` со следующими переменными:

```bash
NEXT_PUBLIC_KODIK_PARSER_URL=ваш_url
NEXT_PUBLIC_ANILIBRIA_PARSER_URL=ваш_url
NEXT_PUBLIC_SIBNET_PARSER_URL=ваш_url
```

### Преимущества новой конфигурации

✅ **Nginx reverse proxy** с оптимизацией производительности

✅ **Автоматический SSL** через Let's Encrypt

✅ **Кэширование статических файлов** для быстрой загрузки

✅ **Сжатие Gzip** для экономии трафика

✅ **Заголовки безопасности** для защиты от атак

✅ **Автоматическое обновление сертификатов**

✅ **Production-ready конфигурация**


### docker/Архитектура

```
Интернет → Nginx (порты 80/443) → Next.js приложение (порт 3000)
                ↓
            SSL сертификаты
            Кэширование
            Сжатие
            Безопасность
```
