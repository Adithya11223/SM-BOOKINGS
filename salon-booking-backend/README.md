# Salon Booking Backend

This is the production-ready Spring Boot backend for the Salon Booking application.

## Technologies
- Java 21
- Spring Boot 3.x
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL
- Flyway Migrations
- MapStruct
- Swagger/OpenAPI
- Bucket4j (Rate Limiting)
- Cloudinary (File Storage)
- Firebase Admin SDK (Push Notifications)

## Prerequisites
- Java 21+
- Maven 3.8+
- PostgreSQL database (or a Neon serverless Postgres instance)

## Configuration

This application uses Spring Profiles (`dev` and `prod`) and strictly relies on Environment Variables for all sensitive credentials. 

### Database Configuration (Neon PostgreSQL)

You must set the following environment variables to run the application. **Do not hardcode these values in the configuration files.**

#### Required Environment Variables
- `DB_URL`: The full JDBC connection string to your PostgreSQL instance. 
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

#### Example for Neon PostgreSQL:
If your Neon connection string is:
`postgresql://neondb_owner:npg_kt3yHwMW7RQi@ep-calm-sky-az2uy53g-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

You must configure the environment variables as follows (Note the `jdbc:` prefix for the URL):

```bash
export DB_URL="jdbc:postgresql://ep-calm-sky-az2uy53g-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export DB_USERNAME="neondb_owner"
export DB_PASSWORD="npg_kt3yHwMW7RQi"
```

> **Note**: Neon requires an SSL connection, which is automatically handled when your connection string contains `sslmode=require`.

### Other Environment Variables
- `APP_JWT_SECRET`: A base64-encoded secure string used to sign JWTs.
- `APP_CORS_ALLOWED_ORIGINS`: Allowed origins (e.g., `https://mysalon.com`).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials for file uploads.
- `APP_FIREBASE_CREDENTIALS_BASE64`: A base64 encoded string of your Firebase `service-account.json`.

## Running the Application Locally

1. Set the required environment variables in your terminal.
2. Compile and run the application using the Maven wrapper:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Startup Process
When the application starts, it will automatically:
1. Connect to the specified PostgreSQL instance.
2. **Validate** the database schema (`hibernate.ddl-auto=validate`).
3. Execute any pending **Flyway Migrations** (e.g., creating tables and seeding the default Admin account).
4. Expose the Health endpoint at `/api/health`, which includes the live database connection status.
5. Log a success message indicating the backend is ready to accept requests.

## API Documentation
Once running, you can access the interactive Swagger UI at:
http://localhost:8080/swagger-ui.html
