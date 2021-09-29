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
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
})

app.get("/urls", (req, res) => {
  console.log(req.cookies["username"])
    const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect('/urls');
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