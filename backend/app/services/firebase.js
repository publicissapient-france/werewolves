const firebase = require('firebase');

/*const config = {
 apiKey: 'AIzaSyAUrl1sJHroKV45wdIUdd1QTZAPqzSLXWY',
 authDomain: 'werewolf-791dc.firebaseapp.com',
 databaseURL: 'https://werewolf-791dc.firebaseio.com/',
 storageBucket: 'bucket.appspot.com',
 };*/
var config = {
  apiKey: "AIzaSyAHpIbUZQjP29-Zp208PIuWlPKlfF4LXuU",
  authDomain: "werewolves-14188.firebaseapp.com",
  databaseURL: "https://werewolves-14188.firebaseio.com",
  projectId: "werewolves-14188",
  storageBucket: "werewolves-14188.appspot.com",
  messagingSenderId: "478219542172"
};

firebase.initializeApp(config);

module.exports.getFirebaseClient = () => {
  return firebase
};