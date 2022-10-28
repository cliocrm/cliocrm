const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { userContext } = req;
  res.render('cliocrm', { userContext });
});

module.exports = router;
