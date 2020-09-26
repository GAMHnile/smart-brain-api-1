const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const morgan = require('morgan');
require('dotenv').config();

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

console.log("let's see it");

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASS,
    database : 'smart-brain'
  }
});


const app = express();

app.use(morgan('combined'));
app.use(cors())

app.use(bodyParser.json());

app.get('/', (req, res)=> { res.send("Hey its running from docker now oh") })
app.post('/signin', signin.handleSignin(db, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})
app.put('/image', (req, res) => { image.handleImage(req, res, db)})
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res)})

app.listen(3500, ()=> {
  console.log('app is running on port 3500');
})
