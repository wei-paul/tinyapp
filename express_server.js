const express = require("express");
const app = express();
const PORT = 3001; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

//Anytime I create a new (get page), I would need to implement that username variable as well
//otherwise, code won't be able to find that page and you're going to get username not defined.
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//find user by email function
const findUserByEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user
    }
  }
  return null
}

function generateRandomString() {
  return Math.random().toString(20).substr(2, 6)
}

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  console.log(req.cookies.user_id)
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
})

app.get("/urls", (req, res) => {
    const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  if (!req.cookies.user_id) {
    return res.status(400).send("Please login before making changes");
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }  
  res.render('registration', templateVars)
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }  
  res.render('login', templateVars)
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // we want make sure that email and password are filled
  if ( !email || !password ) {
    return res.status(400).send("Email or Password cannot be blank!");
  }

  // check to see if email exists in database already
  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send('User with that email does not exist!')
  }
  //Does the password provided from the request match the password of the user?
  if (user.password !== password) {
    return res.status(403).send('Password does not match!')
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls')
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // we want make sure that email and password are filled
  if( !email || !password ) {
    return res.status(400).send("Email or Password cannot be blank!");
  }

  // check to see if email exists in database already
  const user = findUserByEmail(email);

  if(user) {
    return res.status(400).send('User with that email currently exists!')
  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password
  }
  res.cookie('user_id', id);
  res.redirect('/urls')
})


app.post("/urls", (req, res) => {
  console.log(req.body); 
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.cookies.user_id) {
    return res.status(400).send("Please login before making changes");
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls')
})

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = longURL
  res.redirect('/urls')
})

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});