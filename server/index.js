const express = require('express');
const bodyPaser = require('body-parser');
const session = require('express-session');
const massive = require('massive');
const bcrypt = require('bcrypt');

require('dotenv').config();
const app = express();
const saltRounds = 12;
massive(process.env.CONNECTION_STRING).then(db => app.set('db', db));

app.use(bodyPaser.json());
app.use(session({
  secret: "mega hyper ultra secret",
  saveUninitialized: false,
  resave: false,
}));

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, saltRounds).then(hashedPassword => {
    app.get('db').create_user([username, hashedPassword]).then(() => {
      req.session.user = { username };
      res.json({ username });
    }).catch(error => {
      console.log('error A', error);
      res.status(400).json({ message: "An error occurred; for security reasons it can't be disclosed" });
    });
  }).catch(error => {
    console.log('error B', error);
    res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
  })
});

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
        console.log('error D', error);
        res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
      })
    } else {
      res.status(403).json({ message: 'Unknown user' });
    }
  }).catch(error => {
    console.log('error C', error);
    res.status(500).json({ message: "An error occurred; for security reasons it can't be disclosed" });
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.send();
});

function ensureLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(403).json({ message: 'You are not authorized' });
  }
}

app.get('/secure-data', ensureLoggedIn, (req, res) => {
  res.json({ someSecureData: 123 });
});

const PORT = 3030;
app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
