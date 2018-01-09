<img src="https://devmounta.in/img/logowhiteblue.png" width="250" align="right">

# Project Summary

In this project, we'll use the bcrypt library to securely hash user passwords in our database, such that it is impossible to recover the original password, but still possible to know if a password entered by a user matches the original.

At first, we'll allow users to log in with a username and password, and store them in the database in plain text, which is insecure. After that we'll switch to use bcrypt and store hashed passwords.

## Setup

* `Fork` and `clone` this repository.
* `cd` into the project directory.
* Run `yarn`. You know to use yarn instead of npm because there is a `yarn.lock` file.
* Create a Postgres database. Use this project's `db/init.sql` file to create the schema.
* Copy the `env.example` file to a new file called `.env` and paste in the connection string to the postgres database.
* Start the server with `nodemon`.
* Start the web dev server with `npm start`. In your browser, open `http://localhost:3000`.

## Step 1

### Summary

In this step, we'll create the `/register` endpoint to allow users to register.

### Instructions

* Open the `server/index.js` file.
* Navigate to the code for the `/register` endpoint.
* Knowing that `req.body` contains `username` and `password` properties, insert a record into the `users_bcrypt_demo` table. You'll want to utilize the `db/create_user.sql` file.
    * Be sure to handle errors, including duplicate records. If a duplicate exists return a 409. Otherwise return a 500. Error responses should be objects with a single message property.
* After the user record has been created, create a `user` object on the session that contains a `username` property and the username value.
* Send that same user object back to the client.
* Visit the website. Be sure to click on the Register link. Register a user. You are logged in. Now the Fetch Data button works.

### Solution

<details>
<summary><code>index.js</code></summary>

```js
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  app.get('db').create_user([username, password]).then(() => {
    req.session.user = { username };
    res.json({ username });
  }).catch(error => {
    console.log('error', error);
    if (error.message.match(/duplicate key/)) {
      res.status(409).json({ message: "That user already exists" });
    } else {
      res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
    }
  });
});
```
</details>

## Step 2

### Summary

In this step, we'll create a way to log out.

### Instructions

* Open the `server/index.js` file.
* Navigate to the code for the `/logout` endpoint.
* Destroy the session.
* Send a 200 response with no data.
* Visit the website and ensure the Log out button works, and subsequent clicks of Fetch Data result in unauthorized errors.

### Solution

<details>
<summary><code>index.js</code></summary>

```js
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.send();
});
```
</details>

## Step 3

### Summary

In this step, we'll create the `/login` endpoint to allow previously registered users to login.

### Instructions

* Open the `server/index.js` file
* Navigate to the code for the `/login` endpoint.
* Knowing that `req.body` contains `username` and `password` properties, look for a matching record in the `users_bcrypt_demo` table by username. You'll want to utilize the `db/find_user.sql` file.
    * If such a record is not found, return a 403 error with a useful message.
    * If the record is found, but the password doesn't match, similarly return a 403.
    * If any other error occurs, return a 500.
* If no error occurred, create a `user` object on the session, and send that user back as the response (just as in Step 1).
* Visit the website. Log in with the username and password from when you registered. The Fetch Data button should work.

### Solution

<details>
<summary><code>index.js</code></summary>

```js
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  app.get('db').find_user([username]).then(data => {
    if (data.length) {
      if (data[0].password === password) {
        req.session.user = { username };
        res.json({ username });
      } else {
        res.status(403).json({ message: 'Invalid password' });
      }
    } else {
      res.status(403).json({ message: 'Unknown user' });
    }
  }).catch(error => {
    console.log('error', error);
    res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
  });
});
```
</details>

## Step 4

### Summary

In this step, we'll utilize bcrypt during user registration.

### Instructions

* Delete all records from the user table.
    * The stored passwords will no longer work because they aren't hashed.
* Use yarn to install the bcrypt library.
* Open the `server/index.js` file.
* At the top, require the `bcrypt` library into a variable called `bcrypt`.
* Navigate to the code for the `/register` endpoint.
* Use the `bcrypt.hash()`, passing the password and 12 as the number of salt rounds. In the `.then()` callback, use the hashed password in place of the password and create a user record, as before, storing the hashed password. Hint: You can basically move the code you already had inside the `.then()` section.
    * Be sure to handle errors, by putting a `.catch()` after the `bcrypt.hash()` promise's `.then()`. Return a 500.

### Solution

<details>
<summary><code>index.js</code></summary>

```js
const bcrypt = require('bcrypt');
const saltRounds = 12;

// ...

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, saltRounds).then(hashedPassword => {
    app.get('db').create_user([username, hashedPassword]).then(() => {
      req.session.user = { username };
      res.json({ username });
    }).catch(error => {
      console.log('error', error);
      if (error.message.match(/duplicate key/)) {
        res.status(409).json({ message: "That user already exists" });
      } else {
        res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
      }
    });
  }).catch(error => {
    res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
  })
});
```
</details>

## Step 5

### Summary

In this step, we'll utilize bcrypt during user login.

### Instructions

* Open the `server/index.js` file.
* Navigate to the code for the `/login` endpoint.
* Within the existing section of code you've written, within the `find_user` database call's `.then()` callback: instead of directly comparing the password to the one in the database, use the `passwordsMatch` result from the `bcrypt.compare()` method. For `bcrypt.compare()`, pass the password from `req`, and the hashed password from the database.
    * Be sure to handle errors, by putting a `.catch()` after the `bcrypt.compare()` promise's `.then()`. Return a 500.

### Solution

<details>
<summary><code>index.js</code></summary>

```js
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  app.get('db').find_user([username]).then(data => {
    if (data.length) {
      bcrypt.compare(password, data[0].password).then(passwordsMatch => {
        if (passwordsMatch) {
          req.session.user = { username };
          res.json({ username });
        } else {
          res.status(403).json({ message: 'Invalid password' });
        }
      }).catch(error => {
        res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
      })
    } else {
      res.status(403).json({ message: 'Unknown user' });
    }
  }).catch(error => {
    res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
  });
});
```
</details>

## Contributions

If you see a problem or a typo, please fork, make the necessary changes, and create a pull request so we can review your changes and merge them into the master repo and branch.

## Copyright

© DevMountain LLC, 2018. Unauthorized use and/or duplication of this material without express and written permission from DevMountain, LLC is strictly prohibited. Excerpts and links may be used, provided that full and clear credit is given to DevMountain with appropriate and specific direction to the original content.

<p align="center">
<img src="https://devmounta.in/img/logowhiteblue.png" width="250">
</p>
