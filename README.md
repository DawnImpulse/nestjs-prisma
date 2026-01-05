# NestJS with Prisma, MySQL, and Swagger

This project is a NestJS application using Prisma (v7+) with a MySQL database, Dockerized for development, and documented with Swagger.

## Prerequisites

-   Node.js (v18+)
-   Docker & Docker Compose

## Quick Start (Recreation Guide)

Follow these steps to recreate the project from scratch.

### 1. Initialize NestJS Project

```bash
npx -y @nestjs/cli new nestjs-typeorm --package-manager npm
cd nestjs-typeorm
```

### 2. Install Dependencies

Install core dependencies for NestJS, Prisma, and Swagger.

```bash
# Prisma and Database Driver (Prisma 7 uses adapters)
npm install prisma @prisma/client @prisma/adapter-mariadb mariadb

# Config & Validation
npm install @nestjs/config class-validator class-transformer

# Swagger
npm install @nestjs/swagger swagger-ui-express
```

### 3. Configure Database (Docker)

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: nestjs_mysql
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: nestjs_typeorm
    ports:
      - '3306:3306'
    networks:
      - nestjs-network
    volumes:
      - mysql_data:/var/lib/mysql

  app:
    container_name: nestjs_app
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=mysql://root:root@mysql:3306/nestjs_typeorm
    depends_on:
      - mysql
    networks:
      - nestjs-network
    command: npm run start:dev

networks:
  nestjs-network:

volumes:
  mysql_data:
```

Create a `.env` file for local development (outside Docker):

```env
DATABASE_URL="mysql://root:root@localhost:3306/nestjs_typeorm"
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=nestjs_typeorm
PORT=3000
```

### 4. Setup Prisma (v7)

Initialize Prisma:

```bash
npx prisma init
```

**Important:** Update `prisma/schema.prisma`. Note that for Prisma 7 with adapters, we remove the `url` from the datasource in the schema and handle it in config/code.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  // url is handled via config/adapter
}

model User {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Create `prisma.config.ts` in the root:

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### 5. Create Prisma Service

Generate the Prisma module and service:

```bash
npx nest g module prisma
npx nest g service prisma
```

Update `src/prisma/prisma.service.ts` to use the MariaDB adapter (required for Prisma 7 + MySQL):

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionString = process.env.DATABASE_URL || '';
        const adapter = new PrismaMariaDb(connectionString);
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
```

Make `PrismaModule` global by exporting the service:

```typescript
// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 6. Configure Application

Update `src/app.module.ts` to include `ConfigModule`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
// ... imports

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, PrismaModule],
  // ...
})
export class AppModule {}
```

### 7. Setup Swagger

Update `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### 8. Run the Application

1.  Start the database:
    ```bash
    docker-compose up -d mysql
    ```
2.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```
3.  Push schema to database:
    ```bash
    npx prisma db push
    ```
4.  Start the server:
    ```bash
    npm run start:dev
    ```

Access Swagger UI at `http://localhost:3000/api`.
