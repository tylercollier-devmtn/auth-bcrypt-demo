const express = require('express');
const bodyPaser = require('body-parser');
const session = require('express-session');
const massive = require('massive');
const bcrypt = require('bcrypt'); 

const saltRounds = 12;

require('dotenv').config();
const app = express();
massive(process.env.CONNECTION_STRING).then(db => app.set('db', db));

app.use(bodyPaser.json());
app.use(session({
  secret: "mega hyper ultra secret",
  saveUninitialized: false,
  resave: false,
}));
app.use(express.static(`${__dirname}/../build`));

app.post('/register', (req, res) => {
  const db = app.get('db')
  const { username, password } = req.body
  bcrypt.hash(password, saltRounds).then(hashedPassword => {
    db.create_user([username, password])
    .then(() => {
      req.session.user = { username };
      res.json({ user: req.session.user });
    })
    .catch(err => console.error(err));
  });
})

app.post('/login', (req, res) => {
  const db = app.get('db')
  const { username, password } = req.body
  db.find_user([username]).then(users => {
    if(users.length) {
      bcrypt.compare(password, users[0].password).then(passwordsMatch => {
        if(passwordsMatch) {
          req.session.user = { username: users[0].username }
          res.json({ user: req.session.user })
        } else {
          res.status(403).json({ message: 'Wrong Password' })
        }  
      })
    } else {
      res.status(403).json({ message: 'This user does not exist' })
    }
  })
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json()
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
