FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    gnupg2 \
    curl \
    apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl https://packages.microsoft.com/config/debian/12/prod.list | tee /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev \
    && pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install intl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --no-dev --no-interaction || true

COPY . .
RUN composer dump-autoload --optimize --no-interaction

RUN mkdir -p var/cache var/log config/jwt \
    && chmod -R 777 var config/jwt

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
