var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBYPgz86cQz0paK61AZTehkKXaaaxurjR0",
  authDomain: "js-community-server.firebaseapp.com",
  databaseURL: "https://js-community-server.firebaseio.com",
  projectId: "js-community-server",
  storageBucket: "js-community-server.appspot.com",
  messagingSenderId: "561452146855"
};
firebase.initializeApp(config);

module.exports = firebase;


