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

const { ExpressOIDC } = require('@okta/oidc-middleware');
const oidc = new ExpressOIDC({
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
  appBaseUrl: 'http://localhost:3000',
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
app.use('/register', require('./routes/register'));
app.use('/contacts', require('./routes/contacts'));
app.use('/videoconf', require('./routes/videoconf'));
app.use('/support', require('./routes/support'));
app.use('/cliocrmapp', require('./routes/cliocrmapp'));
app.use('/cliocrm', require('./routes/cliocrm'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}`));
