require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static('public'));

app.use(
  require('express-session')({
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: false
  })
);

const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const sessionConfig = {
  secret: "[secret]",
  resave: false,
  saveUninitialized: false,
  cookie: { "maxAge": 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000
  })
};
app.use(session(sessionConfig));

const { ExpressOIDC } = require('@okta/oidc-middleware');
const oidc = new ExpressOIDC({
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
  appBaseUrl: `${process.env.HOST_URL}`,
  scope: 'openid profile',
  routes: {
	    login: {
	      path: "/login"
	    },
	    callback: {
	      path: "/callback",
	      defaultRedirect: "/dashboard"
	    }
	  }
	});

app.use(oidc.router);

app.get("/logout", function(req, res, next) {
	  req.logout(function(err) {
	    if (err) { return next(err); }
	    res.redirect("/");
	  });
	});

app.use('/', require('./routes/index'));
app.use('/cliocollab', require('./routes/cliocollab'));
app.use('/signedin', require('./routes/signedin'));
app.use('/vc', require('./routes/videoconf'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}`));
