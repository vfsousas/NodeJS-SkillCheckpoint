const express = require('express');
const complexApi = require('./complexApi')
const router = express.Router();
const helper = require('../helpers');
const db = require('../../data/db')
const dateCheck = require('../../common/date')
var ObjectId = require('mongodb').ObjectId;
var validator = require('./validation');

router.get('/help', (req, res) => {
    var fs = require('fs');
    var file = __dirname + '/help.json';
    var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json(obj);
});

router.get('/', (req, res) => {
   db.get
    .then(db => db.collection('dimension').aggregate([
        {$project:{
              name: 1,
              description: 1,
              status: 1, 
              creationDate: { $dateToString: { format: "%m/%d/%Y", date: "$creationDate" } },
              modificationDate: { $dateToString: { format: "%m/%d/%Y", date: "$modificationDate" } }, 
        }},
        {$sort: {name: 1}}
    ], function(err, result){
        if(err){
            helper.errorHandling(err, res)
        }else{
            res.json(result);
        }
    }))
});

router.get('/:id', (req, res) => {
    db.get
    .then(db => db.collection('dimension').findOne({'_id': ObjectId(req.params.id)}))
    .then(result => { 
        res.json(result);
    })
    .catch(e => helper.errorHandling(e, res));
});

router.post('/', (req, res) => {
    var validationCheck = true;
    const dimension = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status, 
        creationDate: new Date(), 
        modificationDate: new Date()
    }

    const projectValidate = Object.assign({}, dimension) 
    var errors = validator.validateProject(projectValidate);
    
  

    if(errors.length){
        let error = new Error('Fields: ' + errors[0].path + " ERROR: + "+errors[0].message );
        helper.errorHandling(error, res);          
    } else {
        db.get
        .then(db => {
            helper.checkForExistingRecord(db, 'dimension', 'name', dimension.name, function(check){
                if(check){
                    let error = new Error('Cannot create duplicate records')
                    helper.errorHandling(error, res)
                } else {
                    db.collection('dimension').insertOne(dimension)
                    .then(result => {
                        res.json(result);
                    })
                    .catch(e => helper.errorHandling(e, res));
                }
            })
            
        })
    }           
});

router.put('/:id', (req, res) => {
   var validationCheck = true;
   const dimension = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status, 
        modificationDate: new Date()
    }
    
    const dimensionValidate = Object.assign({}, dimension) 
    var errors = validator.validateProject(dimensionValidate);



    if(errors.length){
         let error = new Error('Fields: ' + errors[0].path + " ERROR: + "+errors[0].message );
        helper.errorHandling(error, res);
        validationCheck = false;
          
    }

     if(validationCheck){
              
            db.get
            .then(db => db.collection('dimension').update(
                {_id: ObjectId(req.params.id)},
                {$set:{  
                        name: dimension.name,
                        description: dimension.description,
                        status:dimension.status, 
                        modificationDate: new Date(),
                    }
                }
            )
            .then(result => {
                let error;
                if(result.result.n == 0){
                    error = new Error('Record not found for update'); 
                    helper.errorHandling(error, res);

                }else if(result.result.nModified == 0){
                    error = new Error('Record not updated');
                    helper.errorHandling(error, res);
                    
                } else {
                    res.json(result)
                }        
            })
            .catch(e => helper.errorHandling(e))
            )}
        })





router.delete('/:id', (req, res) => {
    db.get
    .then(db => db.collection('dimension').remove({_id: ObjectId(req.params.id)}))
    .then(result => { 
        res.json(result);
    })
    .catch(e => helper.errorHandling(e, res));
});

function checkForExistingRecord(db, name, cb){
    db.collection('dimension').findOne({"name": name})
    .then(result => {
        if(result){
            cb(true)
        }else{
            cb(false)
        }
    })
}

module.exports = router;