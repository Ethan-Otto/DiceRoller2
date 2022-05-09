const admin = require("firebase-admin");
const functions = require("firebase-functions");
functions.logger.log("Session Check");
const console =  functions.logger;


module.exports = (req, res, next) => {
  console.log("Session CHECKER REQ", req, "END OF CHECKER");
  const sessionCookie = req.cookies.__session || "";
  console.log("Session DATA", sessionCookie);
  if (sessionCookie === "") {
    //res.send('No Session Cookie');
    console.log("Session Check: No Session")
    res.redirect("/sign-in");
  } else {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(userData => {
        console.log("Logged in:", userData.email);
        console.log("Logged in:", userData);
        req.user = userData;
        next();
      })
      .catch(error => {
        console.log("Session Check: Error:")
        console.log(error)
        //res.send(error);
        res.redirect("/sign-in");
      });
  }
};
