# Local development

Create a repository-root `.env` file using [.env.example](../.env.example) and set both required values:

```text
USER_1_NAME=First payer
USER_2_NAME=Second payer
```

The backend reads this file when started from the `backend` directory, or reads the same names from its process environment. Both names must be nonblank; startup fails if either is missing or blank.

On a fresh database, the backend creates the two user rows from these values while preserving their payer accent colors. The frontend gets the names from the backend's `/api/v1/users` endpoint and from expense and dashboard responses, so no duplicate frontend environment settings are needed. Changing `.env` does not rename existing database users.

The initial Flyway migration no longer contains the user-name seed rows. Existing databases whose Flyway history already includes that migration must be recreated to use this setup, and recreating the database discards its existing expenses. Back up any data you need before recreating it.

Run the backend from `backend` so its relative `.env` import resolves to the repository root. Run the frontend from `frontend`; it continues to call the backend API as before.
