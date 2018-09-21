const express = require('express');
const router = express.Router();
fakeResponse = require('./graph_response.json');
const db = require('../../data/db')
const {errorHandling} = require('../helpers')


router.get('/', (req, res) => {
  res.json(fakeResponse)
})

//need to make it dynamic with dimension and subdimensions from db
const data = [
  {
    "dimension": "Technical Delivery",
    "subdimensions": [
      {
        "name": "Planning",
        "entry": 0,
        "foundation": 0,
        "experienced": 0,
        "expert": 0,
        "thought_leader": 0
      },
      {
        "name": "Execution",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      },
      {
        "name": "Closure",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      }
    ]
  },
  {
    "dimension": "Business Awareness",
    "subdimensions": [
      {
        "name": "Legacy Directv",
        "entry": 0,
        "foundation": 0,
        "experienced": 0,
        "expert": 0,
        "thought_leader": 0
      },
      {
        "name": "AT&T",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      }
    ]
  },
  {
    "dimension": "Leadership",
    "subdimensions": [
      {
        "name": "Communication",
        "entry": 0,
        "foundation": 0,
        "experienced": 0,
        "expert": 0,
        "thought_leader": 0
      },
      {
        "name": "Client Relationship",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      },
      {
        "name": "Coaching",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      }
    ]
  },
  {
    "dimension": "Strategic Accelerators",
    "subdimensions": [
      {
        "name": "Collaboration",
        "entry": 0,
        "foundation": 0,
        "experienced": 0,
        "expert": 0,
        "thought_leader": 0
      },
      {
        "name": "Account Initiatives",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      },
      {
        "name": "Automation Coding",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      },
      {
        "name": "Automation Execution",
        "entry": 0,
        "foundation":0,
        "experienced": 0,
        "expert":0,
        "thought_leader": 0
      }
    ]
  }
]


router.get('/database', (req, res) => {
  db.get
  .then(db => db.collection('skills').aggregate([
    {$unwind: "$teams"}, 
    {$unwind: "$teams.skills"},
    {$group: {_id: {subdimension: "$teams.skills.subdimension", level: "$teams.skills.level"}, "count":{"$sum": 1}} },
    {$project:{
      subdimension: "$_id.subdimension",
      level: { $cond: [ {$eq:["$_id.level", "THOUGHT LEADER"]}, "thought_leader", "$_id.level"] } ,
      count: 1,
      _id: 0
    }},
  ],function(error, response){
    if(error){
      console.error(error)
      errorHandling(error, res)
    }else{
      populateResponse(response, function(populatedResponse){
        res.json(populatedResponse)
      })
    }
  }))
})

function populateResponse(response, cb){
  data.map(obj => {
    obj.subdimensions.map(sub => {
      let keys = Object.keys(sub);
      for(let prop in keys){
        let i = response.findIndex(resp => ((resp.subdimension.toLowerCase() == sub.name.toLowerCase()) && (resp.level.toLowerCase() === keys[prop] )))
        if(i != -1){
          sub[keys[prop]] = response[i].count
        }
      }
    })
  })
  cb(data)
}

module.exports = router;