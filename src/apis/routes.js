const express = require('express');
const router = express.Router();

const skills = require('./skills');
const dimension = require('./dimension');
const subdimension = require('./subdimension');
const users = require('./users');
const charts = require('./charts');

router.use('/skills', skills);
router.use('/dimension', dimension);
router.use('/subdimension', subdimension);
router.use('/users', users);
router.use('/charts', charts);

router.use('/', (req, res) => {
    res.status(404).json('route not found');
});


module.exports = router;