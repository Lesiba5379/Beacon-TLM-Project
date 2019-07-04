const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer(); 
const session = require('express-session');
const cookieParser = require('cookie-parser');
var WSS = require('ws').Server;

const jquery = require('jquery');
var firebase = require('firebase');

//app.use(express.static(path.join(__dirname + '/scripts')));

app.use(express.static('scripts'));

 
//creating websockets server. 
var wss = new WSS({ port: 8700 });
wss.on('connection', function(socket) {
    console.log('Opened Connection 🎉');
  
    var json = JSON.stringify({ message: 'Gotcha' });
    socket.send(json);
    console.log('Sent: ' + json);
  
    socket.on('message', function(message) {
      console.log('Received: ' + message);
  
      wss.clients.forEach(function each(client) {
        var json = JSON.stringify({ message: 'Something changed' });
        client.send(json);
        console.log('Sent: ' + json);
      });
    });
  
    socket.on('close', function() {
      console.log('Closed Connection 😱');
    });
  
});

var broadcast = function() {
    var json = JSON.stringify({
      message: 'Hello hello!'
    });
  
    wss.clients.forEach(function each(client) {
      client.send(json);
      console.log('Sent: ' + json);
    });
}

setInterval(broadcast, 3000);

//end websockets
var firebaseConfig = firebase.initializeApp({
    apiKey: "AIzaSyB63WXUIqzDuGDbfOfdDC6kw-Ek4NZTOhM",
    authDomain: "pwa-push-5d182.firebaseapp.com",
    databaseURL: "https://pwa-push-5d182.firebaseio.com",
    projectId: "pwa-push-5d182",
    storageBucket: "pwa-push-5d182.appspot.com",
    messagingSenderId: "677472924179",
    appId: "1:677472924179:web:0be07a68e86e6a58"
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

/// end session configuration ///

var Users = [];

/// routing configuration. ///
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname +'/index.html')); 
});

app.get('/dashboard',function(req,res){
    res.sendFile(path.join(__dirname +'/protected_page.html')); 
});

app.get('/signup',function(req,res){
    res.sendFile(path.join(__dirname +'/signup.html')); 
});

app.get('/api/v1/beacon-tlm',function(req,res){
    
    
    res.status(200).send({
        success: 'true',
        message: 'beacon TLM data received successfully'
    })
});

app.set('view engine', 'html');
app.set('views','./views');

/// form configuration ///
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/// end form configuration ///


app.post('/signIn',function(req,res){
    if(!req.body.email || !req.body.email){
        res.render('login',{message: "Please enter both email and password"});
    }else{

        var email = req.body.email;
        var password = req.body.password;

        console.log('email: ' + email + ' password: ' + password);


        console.log('sign in method works fine.');

        firebase.auth().signInWithEmailAndPassword(email,password).then(function(){
            res.sendFile(path.join(__dirname +'/protected_page.html'))
        }).catch(function(error){
            console.log(error.code);
            console.log(error.message);
        });
    }
});
app.post('/signUp',function(req,res){
    if(!req.body.email || !req.body.email){
        res.status("400");
        res.send("Invalid details");
    }else{
 
        var email = req.body.email;
        var password = req.body.password;

        console.log('email: ' + email + ' password: ' + password);

        
        firebase.auth().createUserWithEmailAndPassword(email,password).then(function(){
            res.sendFile(path.join(__dirname +'/protected_page.html'))
        })
        .catch(function(error){
            console.log(error.code);
            console.log(error.message);
        });

    }

});

app.post('/login',function(req,res){

    if(!req.body.email || !req.body.password){
        res.render('login',{message: "Please enter both email and password"});
    }else{

        var email = req.body.email;
        var password = req.body.password;
        
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
            res.sendFile(path.join(__dirname +'/protected_page.html'))
        }).catch(function(error) {
            console.log(error.code);
            console.log(error.message);
        });
    }
});

app.get('/logout', function(req, res){
    firebase.auth().signOut().then(function() {
        console.log("Logged out!")
     }, function(error) {
        console.log(error.code);
        console.log(error.message);
     });
    res.redirect('/');
 });

app.listen(9200);

console.log('Running at Port 9000');