const bcrypt = require('bcrypt');
const saltRounds = 15;

bcrypt.hash('ilovejustinbieber', saltRounds).then(hashedPassword => {
  console.log('The hashed password is', hashedPassword);
  bcrypt.compare('ilovejustinbieber2', hashedPassword).then(doPasswordsMatch => {
    console.log('doPasswordsMatch', doPasswordsMatch);
  })
}).catch(error => {
  console.log('-------------- error', error);
});