const fetch = require('node-fetch');

const createSession = (email, password, res)=>{
  /*
  get userid from database,
  generate token with user email,
  store user id with token in redis
  send token object to front end
  Or http request to signin to do the work
  */
 fetch('http://localhost:3500/signin', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: email,
        password: password
      })
    }).then(resp=>resp.json())
    .then(data=>{
      res.json(data)
    })
    .catch(err=> res.status(400).json("unable to signin"))
}



const handleRegister =async (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    await db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            
            //res.json(user[0]);
          })
      })
      .then(trx.commit)
      .then(val=> createSession(email , password, res ))
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
  handleRegister: handleRegister
};


