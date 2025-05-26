FROM php:8.2-cli

# Instala dependencias del sistema necesarias para Symfony
RUN apt-get update && apt-get install -y \
    git unzip zip libpq-dev libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establece el directorio de trabajo
WORKDIR /var/www/html

# Instala dependencias de PHP si no están instaladas
RUN composer install || true

# Expone el puerto 8000
EXPOSE 8000

# Arranca el servidor de Symfony/PHP
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
