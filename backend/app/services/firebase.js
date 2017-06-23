var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBJ65Igp0vl6grrb9imchzKITnUI66VSNQ",
  authDomain: "werewolves-ai-176f8.firebaseapp.com",
  databaseURL: "https://werewolves-ai-176f8.firebaseio.com",
  projectId: "werewolves-ai-176f8",
  storageBucket: "werewolves-ai-176f8.appspot.com",
  messagingSenderId: "489003325757"
};

firebase.initializeApp(config);

module.exports.getFirebaseClient = () => {
  return firebase
};