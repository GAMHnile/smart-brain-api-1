const jwt = require('jsonwebtoken');
const redis = require("redis");
const { promisify } = require("util");


const redisClient = redis.createClient(process.env.REDIS_URI);

const redisSetAsync = promisify(redisClient.set).bind(redisClient);
const redisGetAsync = promisify(redisClient.get).bind(redisClient);

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
  return redisSetAsync(token, id)
  .then(()=>{
    return {userId: id, token, success: "true"}
  })
  .catch(console.log);
}

const unauthorised = "unauthorised";

const getAuthTokenId =(token)=>{
  return redisGetAsync(token)
  .then(reply=>{
    if(!reply){
     return unauthorised
    }else{
      return {id: reply}
    }
  }).catch(console.log);

}

const signinAuthentication = (db, bcrypt)=> (req, res)=>{
  const { authorization } = req.headers;
  if(authorization){
    getAuthTokenId(authorization)
    .then(data=>{
      data === unauthorised? res.status(400).json("unauthorised"):
      res.json(data);
    })
    .catch(err=>  res.status(400).json("An error occured"))
  }

  return !authorization &&
    handleSignin(db, bcrypt, req)
    .then(data=> data.id && data.email? createSession(data) : Promise.reject(data))
    .then(session=> res.send(session))
    .catch(err=> res.status(400).json(err))

}

module.exports = {
  signinAuthentication,
  redisClient
}