const firebase = require("firebase");

const config = {
    apiKey: "AIzaSyAUrl1sJHroKV45wdIUdd1QTZAPqzSLXWY",
    authDomain: "werewolf-791dc.firebaseapp.com",
    databaseURL: "https://werewolf-791dc.firebaseio.com/",
    storageBucket: "bucket.appspot.com"
};

firebase.initializeApp(config);

module.exports.getFirebaseClient = () => {
    return firebase
};