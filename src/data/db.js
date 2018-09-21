const MongoClient = require('mongodb').MongoClient;
const {dbhost, options} = require('../../config');

const state = {
    db: null,
}

const connect = function(cb) {
    MongoClient.connect(dbhost, options, function(err, db) {
        if (err) return done(err)
        state.db = db
        cb(state.db)
    })
}

const get = function(){
    return new Promise(function(resolve,reject){
        if(!state.db){
            connect(function(db){
                resolve(db)
            })
        } else {
            resolve(state.db)
        }
    })
}
  
module.exports = {
    get: get()
}
