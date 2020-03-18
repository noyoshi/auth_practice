const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require("./secrets");
var GitHubStrategy = require("passport-github2").Strategy;
var partials = require("express-partials");
var session = require("express-session");
var express = require("express");
var passport = require("passport");

module.exports = {
  appSetup: function(passport, bodyParser) {
    // The order of these things is important... nice
    var app = express();
    app.set("views", __dirname + "/views");
    app.use(express.static(__dirname + "/static"));
    app.set("view engine", "ejs");
    app.use(partials());
    // Why?
    app.use(
      session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    return app;
  },
  passportSetup: function() {
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
    return passport;
  }
};
