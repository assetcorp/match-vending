
# Installing & Running the Application

To install the application, run `yarn`. This would install all dependencies. Then `yarn dev` to start and run the application in development mode.

# Environment Variables

For this application to work well, you need to create a `.env` file in the projects root directory. This file includes all the environment variables needed for the application to work. See sample file contents below:

```.env

# Database Secrets
DB_HOST=localhost
DB_USER=your_mysql_user_name
DB_PASSWORD=your_mysql_password
DB_NAME=your_db_name
DB_PORT=3306
DB_DIALECT=mysql
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# JWT Secrets
JWT_SECRET=some_secret

# App Secrets
WHITELIST_DOMAINS='[]' # This is used to restrict CORS to specific domains

```

Also note that you should have a `.env.test.local` for testing purposes.

# Building & deploying

Use `yarn build` to build the application. The output of the build would be populated inside the `.next` directory. Then `yarn start` would start the application in production mode.

# Testing

Use `yarn test` to test the application.

# Additional Information

Please note the following:

- This application uses NextJS to handle API routes. [https://nextjs.org](NextJS).
- The API endpoint is `HOST_NAME/api/v1/`
- The application uses sequelize as an ORM to handle database management. [https://sequelize.org/](Sequelize)
