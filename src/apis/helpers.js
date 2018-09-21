var ObjectId = require('mongodb').ObjectId;

const errorHandling = (err, res) => {
    const error = {
        error: {
            name: err.name || "",
            message: err.message
        }
    }
    console.error(error);
    res.status(503).send(error)
}

const checkForExistingRecord = (db, collection, criteria, name, cb) => {
    let filter = {}
    filter[criteria] = name 
    db.collection(collection).findOne(filter)
    .then(result => {
        if(result){
            cb(true)
        }else{
            cb(false)
        }
    })
}


const checkForExistingRecordSubsimension = (db, collection, criteria, name, dimension, cb) => {
    db.collection(collection).findOne({
        $and:
        [
            {'name': name},
            {'dimensionId': ObjectId(dimension)}
        ]
    })
    .then(result => {
        if(result){
            cb(true)
        }else{
            cb(false)
        }
    })
}

const checkForExistingRecordOnUpdate = (db, collection, criteria, name, id, dimension, cb) => {
    let filter = {}
    db.collection(collection).findOne( { $and: [
        {'name': name}, 
        {_id: {$ne: ObjectId(id)} },
        {'dimensionId': ObjectId(dimension)}
     ] })
    .then(result => {
        if(result){
            cb(true)
        }else{
            cb(false) 
        }
    })
}

module.exports = {
    errorHandling,
    checkForExistingRecord,
    checkForExistingRecordOnUpdate,
    checkForExistingRecordSubsimension
}