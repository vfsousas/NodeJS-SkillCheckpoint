const express = require('express');
const router = express.Router();
const db = require('../../data/db');
const {errorHandling} = require('../helpers');


router.get('/', (req, res) => {
  db.get
  .then(db => db.collection('skills').aggregate([
    {$unwind: "$teams"}, 
    {$group: {_id: {overall_score: "$teams.overall_score"}, "count":{"$sum": 1}} },
    {$project: {
      _id: 0,
      overall_score: '$_id.overall_score',
      count: 1,
    }}
  ],function(error, response){
    if(error){
      console.error(error)
      errorHandling(error, res)
    }else{
        res.json(response)
    }
  }))
})


module.exports = router;