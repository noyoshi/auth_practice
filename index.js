const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require("./secrets");

var express = require("express");
var session = require("express-session");

var passport = require("passport");
var GitHubStrategy = require("passport-github2").Strategy;
var partials = require("express-partials");

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function() {
        // To keep the example simple, the user's GitHub profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the GitHub account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    }
  )
);

var app = express();

// The order of these things is important... nice
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(partials());
// Why?
app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: false })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res) {
  console.log(req.user);
  res.render("index", { user: req.user });
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  function(req, res) {
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  }
);

app.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/oof" }),
  function(req, res) {
    console.log(req);
    // TODO redirecting does not send the context :(
    // res.render("index", { user: req.user });
    res.redirect("/");
  }
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(3000);

console.log(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
