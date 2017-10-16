# Auth-bcrypt

Shows off simple (but legit) auth using bcrypt.

## Instructions

```
npm install
```

Be sure to create a .env file, based on .env.example.

Initialize your database by running the statements from `db/init.sql`.

```
npm start
```

Then, in a separate terminal:

```
nodemon server/index.js
```

First register a user. Then you can login as that user.
