const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
  apiKey: "AIzaSyDZvAjRUvByha6p9I44P-otb2Oc3033bWM",
  authDomain: "kiei-451-6db1c.firebaseapp.com",
  projectId: "kiei-451-6db1c",
  storageBucket: "kiei-451-6db1c.appspot.com",
  messagingSenderId: "88867039116",
  appId: "1:88867039116:web:700a7121e13bce39fb98a9"
} // replace

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase