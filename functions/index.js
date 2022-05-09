const functions = require('firebase-functions');
const express=require('express')
//const port = process.env.PORT || 3000
const compression=require('compression')
const path=require('path');
const app = express()

const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const saltedMd5=require('salted-md5')
const multer=require('multer')
//const upload=multer({storage: multer.memoryStorage()})
require('dotenv').config({path: __dirname + '/.env'})


//functions.logger.log("Hello from info. Here's an object:", someObj);
const console =  functions.logger

//const decoder = require("./app/decoder");

//const val = decoder.decodeSum('/r 1000d20 + 1000d8')
//console.log(val)

app.use(express.urlencoded())
app.use(express.json());


// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(compression())
app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/', authMiddleware, async function (req, res) {
  console.log(req.user)
  res.render("pages/dashboard",{user: req.user});
});

app.get('/dummy', function(req,res){
  console.log('dummy_loaded')
  res.send('This is the Dummy Page');
});

app.get('/dashboard', authMiddleware, async function (req, res) {
  console.log('user', req.user)
  res.render("pages/dashboard",{user: req.user});
});

app.get('/testing', function(req, res){
  //res.send("dingy")
  //console.log("TESTING REQ", req);
  //console.log("Params", req.params);
  res.send(String(req.params) + String(req.body))
  //const st = JSON.stringify(req);
  //res.json(st);
  
});


app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get('/image', (req, res) =>{
  url = 'https://firebasestorage.googleapis.com/v0/b/roller-revamp.appspot.com/o/enemies%2Fshadow_mastif.png?alt=media&token=e37f8c66-7a7d-4950-a6de-86e547b799f9'
  res.send('<img src = ' + url + '>');
});


var admin = require("firebase-admin");
if (typeof process.env.BUCKET_URL == 'undefined'){
  throw "undefined env BUCKET"
}
console.log(process.env.BUCKET_URL)
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://roller-revamp.firebaseio.com",
  storageBucket: process.env.BUCKET_URL
});


//console.log(admin.credential.refreshToken())
// Bucket setup
app.locals.bucket = admin.storage().bucket()
let db=admin.firestore();
let a=db.collection('Actions');


app.get("/create_roll", authMiddleware, async function (req, res) {
  res.render("pages/create_roll", { user: req.user });
});

app.get("/show_rolls", authMiddleware, async function (req, res) {
  const data_list = [];
  await db.collection("Actions").where("userid", "==", req.user.user_id)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            data_list.push(doc.data());
            console.log(doc.id, " => ", doc.data().roll);
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
    console.log(data_list);
  res.render("pages/show_rolls", { user: req.user, data_list: data_list });
});

app.post('/create_roll',authMiddleware, async (req,res)=>{

  let docRef= db.collection('Actions').doc()
  console.log(req.body)
  await docRef.set({
    userid: req.user.user_id,
    name: req.body.name,
    roll: req.body.roll, 
    icon: req.body.icon
    //position: req.body.action.position,
    //iconid: req.body.action.iconid
    });
  res.send('done');
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/sign-in");
});

app.post("/sessionLogin", async (req, res) => {
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501

  const idToken = req.body.idToken;
  const expiresIn = 60* 60 * 24 *5 *1000;
  console.log("In Session Login")
  try{
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })
    const options = { maxAge: expiresIn, httpOnly: true };
    res.cookie('__session', sessionCookie, options);
    console.log('cookie create', res.cookie)
    res.status(200).send(JSON.stringify({ status:'success'}))
  } catch (err){
    res.status(401).send('UNAUTHORIZED REQUEST!');
    console.log(err)
  }
});

console.log('Logging Running')
exports.app = functions.https.onRequest(app);

//app.listen(port, 'localhost',(req,res)=>{
//console.info(`Running on ${port}`)
//})