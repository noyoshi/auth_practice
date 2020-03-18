const { appSetup, passportSetup } = require("./setup");

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

var passport = passportSetup();
var app = appSetup(passport, bodyParser);

app.get("/", function(req, res) {
  res.render("index", { user: req.user });
});

app.get("/home", function(req, res) {
  const sorter = (a, b) => {
    return b.points - a.points;
  };

  // TODO load this from an external data store?
  const data = [
    { name: "noyoshi", points: 1000 },
    { name: "Student069", points: 100 }
  ];

  data.sort(sorter);
  console.log(req.user);

  const userid = req.user ? req.user.id : 0;
  const username = req.user ? req.user.username : "";
  console.log(username);

  res.render("home", {
    data: data,
    userid: userid,
    username: username
  });
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  function(req, res) {
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  }
);

app.get("/puzzle", function(req, res) {
  console.log(req.user);
  // get the data associated with the user?

  res.render("puzzle", { user: req.user });
});

app.post("/puzzle/submit", jsonParser, function(req, res) {
  console.log(req.body);
  res.redirect("/");
});

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
