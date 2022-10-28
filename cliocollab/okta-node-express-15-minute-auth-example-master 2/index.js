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
  appBaseUrl: process.env.HOST_URL,
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/callback`,
  scope: 'openid profile',
  routes: {
    loginCallback: {
      path: '/callback'
    }
  }
});

app.use(oidc.router);

app.get('/logout', (req, res) => {
	  if (req.userContext) {
	    const idToken = req.userContext.tokens.id_token
	    const to = encodeURI(process.env.HOST_URL)
	    const params = `id_token_hint=${idToken}&post_logout_redirect_uri=${to}`
	    req.logout()
	    res.redirect(`${process.env.OKTA_ORG_URL}/oauth2/default/v1/logout?${params}&output=embed`)
	  } else {
	    res.redirect('/')
	  }
	})

app.use('/', require('./routes/index'));
app.use('/register', require('./routes/register'));
app.use('/contacts', require('./routes/contacts'));
app.use('/videoconf', require('./routes/videoconf'));
app.use('/support', require('./routes/support'));
app.use('/cliocrmapp', require('./routes/cliocrmapp'));
app.use('/cliocrm', require('./routes/cliocrm'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}`));
