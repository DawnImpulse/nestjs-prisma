# NestJS with Prisma, MySQL, and Swagger

This project is a NestJS application using Prisma (v7+) with a MySQL database, Dockerized for development, and documented with Swagger.

## Prerequisites

-   Node.js (v18+)
-   Docker & Docker Compose

## Run the Application

Both the database and application are inside Docker only

1.  Ensure `.env` matches Docker settings (or override variables):
    ```env
    DATABASE_URL="mysql://root:root@mysql:3306/nestjs_typeorm"
    MYSQL_ROOT_PASSWORD=root // change it
    MYSQL_DATABASE=nestjs_typeorm // change it
    ```
    *Note: The host is `mysql` (container name) instead of `localhost`.*

2.  Start the services:
    ```bash
    docker-compose up --build
    ```

3.  Push the schema to the database (from your local machine):
    ```bash
    # Override DATABASE_URL to connect to the exposed localhost port
    DATABASE_URL="mysql://root:root@localhost:3306/nestjs_typeorm" npx prisma db push
    ```

4.  View logs:
    ```bash
    docker-compose logs -f app
    ```

### Access

* Service is available at `http://locahost:3000`
* Swagger UI at `http://localhost:3000/api`
