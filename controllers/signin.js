const jwt = require('jsonwebtoken');
const redis = require("redis");

const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (db, bcrypt, req) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject('incorrect form submission');
  }
  return db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => user[0])
          .catch(err => Promise.reject('unable to get user'))
      } else {
        Promise.reject('wrong credentials')
      }
    })
    .catch(err => Promise.reject('wrong credentials'))
}

const signToken = (email) => {
  const jwtPayload = {email}
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: "2 days"});
}

const createSession = (user)=>{
  const {email, id} = user; 
  const token = signToken(email);
  return {userId: id, token, success: "true"}
}


const getAuthTokenId =(token)=>{console.log(token)}

const signinAuthentication = (db, bcrypt)=> (req, res)=>{
  const { authorization } = req.headers;

  return authorization? getAuthTokenId(authorization):
    handleSignin(db, bcrypt, req)
    .then(data=> data.id && data.email? createSession(data) : Promise.reject(data))
    .then(session=> res.send(session))
    .catch(err=> res.status(400).json(err))

}

module.exports = {
  signinAuthentication
}