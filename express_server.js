const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { getUrlsForUser, findUserByEmail, generateRandomString } = require('./helpers');
const { urlDatabase, users } = require('./database');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3001;
//middlewares
app.use(cookieSession({
  name: 'encryptedcookie',
  keys: ['my secret key', 'yet another secret key']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Get Requests:
//GET '/' PAGE
app.get("/", (req, res) => {
  const id = req.session['user_id'];
  const user = users[id];
  if (!user) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
});

//GET 'CREATE NEW URL PAGE'
app.get('/urls/new', (req, res) => {
  const id = req.session['user_id'];
  const user = users[id];
  const templateVars = { user: users[req.session.user_id] };
  if (!user) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

//GET 'MAIN PAGE'
app.get('/urls', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  if (!user) {
    return res.status(401).send("You must <a href='login'> Login </a> first");
  }

  const urls = getUrlsForUser(user.id);

  const templateVars = { urls, user };
  res.render('urls_index', templateVars);

});

//GET 'EDIT URL PAGE'
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  if (!req.session.user_id) {
    return res.status(400).send('Please login before making changes');
  }
  res.render('urls_show', templateVars);
});

//GET 'REDIRECT TO ORIGINAL URL PAGE (i.e. google.com, youtube.com, etc.)
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('That shortURL is not registered in the database, please sign in to make changes');
  }
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL);
});

//GET 'REGISTER' PAGE
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('registration', templateVars);
});

//GET 'LOGIN' PAGE
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});

//GET 'JSON' PAGE
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//POST:
//POST 'LOGOUT' PAGE
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//POST 'LOGIN' PAGE
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  if (!user) {
    return res.status(403).send('Email not registered.');
  }
  const hashedPassword = user.password;
  console.log('hashed password is', hashedPassword);
  // we want make sure that email and password are filled
  if (!email || !password) {
    return res.status(400).send('Email or Password cannot be blank!');
  }

  // check to see if email exists in database already
  
  //Does the password provided from the request match the password of the user?
  if (bcrypt.compareSync(password, hashedPassword) === false) {
    return res.status(403).send('Password does not match!');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//POST 'REGISTER' PAGE
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // we want make sure that email and password are filled
  if (!email || !password) {
    return res.status(400).send('Email or Password cannot be blank!');
  }

  // check to see if email exists in database already
  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send('User with that email currently exists!');
  }

  const id = generateRandomString();

  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      users[id] = {
        id: id,
        email: email,
        password: hash
      };
      console.log(users);
      res.redirect('/login');
    });

});

//POST 'URLS' PAGE
app.post('/urls', (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL , userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

//POST 'EDIT URL' PAGE
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].longURL = longURL;
  res.redirect('/urls');
});

//POST 'DELETE' PAGE
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    return res.status(400).send('Please login before making changes');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
//LISTEN PORT:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

