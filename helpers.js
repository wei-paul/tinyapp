const { urlDatabase } = require('./database')

//get Urls for userId
const getUrlsForUser = function(id) {
  const results = {};
  const keys = Object.keys(urlDatabase);

  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      results[shortURL] = url;
    }
  }
  return results;
};

//find user by email function
const findUserByEmail = (email, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//Generate Random string.
const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6);
};

module.exports = {
  getUrlsForUser,
  findUserByEmail,
  generateRandomString
}