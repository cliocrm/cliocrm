const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { userContext } = req;
  res.render('cliocollab', { userContext });
});

module.exports = router;
