const express = require('express');
const router = express.Router();
const helper = require('../helpers');
const db = require('../../data/db')
const ObjectId = require('mongodb').ObjectID


router.get('/', (req, res) => {
    const geo = "Brazil"
    db.get
        .then(db => db.collection('skills').aggregate([
            {$project: {
                _id : 1,
                name: 1,
            }},
        ], function(error, response){
            if(error) helper.errorHandling(error, res)
            else {
                response.map(user => user.geo = "Brazil")
                res.send(response)
            }
        }))
        
});

module.exports = router