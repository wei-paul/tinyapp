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

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
})

app.get("/urls", (req, res) => {
  console.log(req.cookies["username"])
    const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
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

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect('/urls');
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

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(20).substr(2, 6)
}