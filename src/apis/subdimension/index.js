const express = require('express');
const router = express.Router();
const helper = require('../helpers');
const db = require('../../data/db')
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
    .then(db => db.collection('subdimension').aggregate([
        {$lookup: {
                from: 'dimension',
                localField: 'dimensionId',
                foreignField: '_id', 
                as: 'dimension',
              }
         },
        {$project:{
              name: 1,
              description: 1,
              status: 1, 
              dimensionId: 1,
              dimensionName: 1,
              creationDate: { $dateToString: { format: "%m/%d/%Y", date: "$creationDate" } },
              modificationDate: { $dateToString: { format: "%m/%d/%Y", date: "$modificationDate" } },
              dimensionName:  { $arrayElemAt: [ '$dimension.name', 0 ] },
        }},
        {$sort: {name: 1}}
    ], function(err, result){
        if(err){
            helper.errorHandling(err, res)
        }else{
            if(req.query.dimension){
                result = result.filter(subdimension => subdimension.dimensionName == req.query.dimension)
            }
            res.json(result);
        }
    }))
});

router.get('/:id', (req, res) => {
    db.get
    .then(db => db.collection('subdimension').findOne({_id: ObjectId(req.params.id)}))
    .then(result => { 
        res.json(result);
    })
    .catch(e => helper.errorHandling(e, res));
});

router.post('/', (req, res) => {
    const subdimension = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status, 
        dimensionId: req.body.dimensionId,
        creationDate: new Date(),
        modificationDate: new Date()
    }

    const dimensionValidate = Object.assign({}, subdimension) 
    var errors = validator.validateSubDimension(dimensionValidate);
    
    if(errors.length){
        let error = new Error('Fields: ' + errors[0].path + " ERROR: + "+errors[0].message );
        helper.errorHandling(error, res);          
    } else {
        db.get
        .then(db => {
            helper.checkForExistingRecordSubsimension(db, 'subdimension', 'name', subdimension.name, subdimension.dimensionId, function(check){
                if(check){
                    let error = new Error('Cannot create duplicate records')
                    helper.errorHandling(error, res)
                } else {
                    subdimension.dimensionId = ObjectId(subdimension.dimensionId)
                    db.collection('subdimension').insertOne(subdimension)
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
   const subdimension = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status,
        dimensionId: req.body.dimensionId,
    }

    const dimensionValidate = Object.assign({}, subdimension) 
    var errors = validator.validateSubDimension(dimensionValidate);

    if(errors.length){
         let error = new Error('Fields: ' + errors[0].path + " ERROR: + "+errors[0].message );
        helper.errorHandling(error, res);
        validationCheck = false;
    } else {              
            db.get
            .then(db => {
                helper.checkForExistingRecordOnUpdate(db, 'subdimension', 'name', subdimension.name, 
                                            req.params.id, subdimension.dimensionId,function(check){
                    if(check){
                        let error = new Error('Cannot create duplicate records')
                        helper.errorHandling(error, res)
                    } else {
                            db.collection('subdimension').update(
                                {_id: ObjectId(req.params.id)},
                                {$set:
                                    {   
                                        name: subdimension.name,
                                        description: subdimension.description,
                                        status: subdimension.status,
                                        dimensionId: ObjectId(subdimension.dimensionId),
                                        modificationDate: new Date()
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
                        }
                    })
            })
        }
    })





router.delete('/:id', (req, res) => {
    db.get
    .then(db => db.collection('subdimension').remove({_id: ObjectId(req.params.id)}))
    .then(result => { 
        res.json(result);
    })
    .catch(e => helper.errorHandling(e, res));
});



module.exports = router;