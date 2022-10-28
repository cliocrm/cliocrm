const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { userContext } = req;
  res.render('cliocrmapp', { userContext });
});

module.exports = router;
