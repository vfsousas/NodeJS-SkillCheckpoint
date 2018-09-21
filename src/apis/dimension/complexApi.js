const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('complex api projects')
});

module.exports = router;