const express = require('express');
const router = express.Router();
const helper = require('../helpers');
const db = require('../../data/db')
const ObjectId = require('mongodb').ObjectID
//const validator = require('./validation');
const summary_charts = require('./summary_charts');
const overall_score = require('./overall_score')
//const _ = require('lodash');

router.use('/summary-charts', summary_charts)
router.use('/overall-score', overall_score)

router.get('/help', (req, res) => {
    const help = require('./help.json')
    res.json(help);
});

router.delete('/:id', (req, res) => {
    db.get
        .then(db => db.collection('skills').deleteOne({_id: ObjectId(req.params.id)}))
        .then( result => res.json(result))
        .catch( e => helper.errorHandling(e, res) )
})

router.put('/:id', (req, res) => {
    if(!req.body.name || !req.body.dimensions){
        let error = new Error("missing name and skills are required")
        helper.errorHandling(error, res)
    } else {

        let newUser = {
            name: req.body.name,
            dimensions: req.body.dimensions
        };

        checkNameForUpdate(newUser.name, req.params.id)
            .then(name => {
                if(!name){

                    newUser.dimensions.map((dimension) => {
                        dimension.dimensionId = ObjectId(dimension.dimensionId)
                        dimension.subdimensions.map(subdimension => {
                            subdimension.subdimensionId = ObjectId(subdimension.subdimensionId)
                        })
                    })

                    db.get
                    .then(db => db.collection('skills').updateOne(
                        {_id: ObjectId(req.params.id)},
                        newUser
                    ))
                    .then(result => res.json(result))
                    .catch(e => helper.errorHandling(e, res))
                } else {
                    helper.errorHandling(new Error('Name already exists'), res)
                }
            })
    }
})

router.get('/alt', (req, res) => {

    let name = req.query.name ? req.query.name.toUpperCase() : null;
    let team = req.query.team ? req.query.team.toUpperCase() : null;

    //in case name and team are not received in the query params api will return all records
    if(!name && !team){
        db.get
        .then(db => db.collection('skills').find().toArray())
        .then(result => {
            formatResult(result, function(formattedResult){
                res.json(formattedResult)
            })
        })
        .catch(e => helper.errorHandling(e, res))

     //in case only name is received in query params api will return records filtered by name
    } else if(!team ){
            db.get
            .then(db => db.collection('skills').find({"name": name}).toArray())
            .then(result => {
                formatResult(result, function(formattedResult){
                    res.json(formattedResult)
                })
            })
            .catch(e => helper.errorHandling(e, res))
    } 
    // in case request has name and team api will return records filtered by name and team
    else{
        db.get
        .then(db => db.collection('skills').find({"name": name, "teams.name": team},
                                                  {'teams.name.$': 1, name: 1 }  ).toArray())
        .then(result => {
            formatResult(result, function(formattedResult){
                res.json(formattedResult)
            })
        })
        .catch(e => helper.errorHandling(e, res))
    }
    
});


router.get('/', (req, res) => {
    db.get
        .then(db => db.collection('skills').aggregate([
            {$unwind: '$dimensions'},
            {$unwind: '$dimensions.subdimensions'},
            {$lookup: {
                from: 'subdimension',
                        localField: 'dimensions.subdimensions.subdimensionId',
                        foreignField: '_id', 
                        as: 'subdimension',
                }
            },
            {$lookup: {
                from: 'dimension',
                        localField: 'dimensions.dimensionId',
                        foreignField: '_id', 
                        as: 'dimension',
                }
            },
            {$group: {_id: {
                _id: "$_id",
                name: "$name"},
                dimensions: 
                {$push: 
                    { dimension: {$arrayElemAt: [ "$dimension.name", 0 ]} , 
                    dimensionId: '$dimensions.dimensionId',
                    subdimensionId: '$dimensions.subdimension.subdimensionId',
                    subdimension: {$arrayElemAt: [ "$subdimension.name", 0 ]}, 
                    level: "$dimensions.subdimensions.level"
                    }
                }
            }},
            {$project: {
                _id: '$_id._id',
                name: '$_id.name',
                dimensions: 1
            }}    
    ], function(err, result){
        if(err){
            helper.errorHandling(err, res)
        }else{            
            //passar por cada registro
            result.map( resource => {
                resource.dimensions = resource.dimensions.reduce( (newSkills, skill) => {
                    let dimensions = newSkills.map( skill => skill.dimensionName)
                    let index = dimensions.indexOf(skill.dimension)
                    //se nao existir objeto no array skills com a dimensao => criar objeto com a dimensao e criar array subdimension
                    if( index == -1) {
                        newSkills.push({ 
                            "dimensionName": skill.dimension, 
                            "dimensionId": skill.dimensionId,
                            "subdimensions": [
                                {"subdimensionName": skill.subdimension, 
                                "subdimensionId": skill.subdimensionId,
                                "level": skill.level
                                }
                            ]
                        })
                    } else{
                         //se existir objeto no array skills com a dimensao => adicionar subdimension
                        newSkills[index].subdimensions.push({
                            "subdimensionName": skill.subdimension, 
                            "level": skill.level
                        })
                    } 
                    return newSkills
                }, newSkills = [])
            })

            res.json(result);
        }
    }))
    
})


router.get('/:name/dimensions', (req, res) => {
    db.get
        .then(db => db.collection('skills').aggregate([
            {$match: {"name": req.params.name}},
            {$unwind: '$dimensions'},
            {$lookup: {
                from: 'dimension',
                        localField: 'dimensions.dimensionId',
                        foreignField: '_id', 
                        as: 'dimension',
                }
            },
            {$group: {_id: {
                _id: "$_id",
                name: "$name"},
                dimensions: 
                {$push: 
                    { name: {$arrayElemAt: [ "$dimension.name", 0 ]} , 
                    id: '$dimensions.dimensionId',
                    }
                }
            }},
            {$project: {
                _id: 0,
                dimensions: 1
            }}    
    ], function(err, result){
        if(err){
            helper.errorHandling(err, res)
        }else{            
            res.json(result);
        }
    }))
    
})

router.get('/:id', (req, res) => {
    db.get
        .then(db => db.collection('skills').aggregate([
            {$match: {'_id': ObjectId(req.params.id)} },
            {$unwind: '$dimensions'},
            {$unwind: '$dimensions.subdimensions'},
            {$lookup: {
                from: 'subdimension',
                        localField: 'dimensions.subdimensions.subdimensionId',
                        foreignField: '_id', 
                        as: 'subdimension',
                }
            },
            {$lookup: {
                from: 'dimension',
                        localField: 'dimensions.dimensionId',
                        foreignField: '_id', 
                        as: 'dimension',
                }
            },
            {$group: {_id: {
                _id: "$_id",
                name: "$name"},
                dimensions: 
                {$push: 
                    { dimension: {$arrayElemAt: [ "$dimension.name", 0 ]} , 
                    dimensionId: '$dimensions.dimensionId',
                    subdimensionId:{$arrayElemAt:[ "$subdimension._id", 0]},
                    subdimension: {$arrayElemAt: [ "$subdimension.name", 0 ]}, 
                    level: "$dimensions.subdimensions.level"
                    }
                }
            }},
            {$project: {
                _id: '$_id._id',
                name: '$_id.name',
                dimensions: 1
            }}    
    ], function(err, result){
        if(err){
            helper.errorHandling(err, res)
        }else{            
            //passar por cada registro
            result.map( resource => {
                resource.dimensions = resource.dimensions.reduce( (newSkills, skill) => {
                    let dimensions = newSkills.map( skill => skill.dimensionName)
                    let index = dimensions.indexOf(skill.dimension)
                    //se nao existir objeto no array skills com a dimensao => criar objeto com a dimensao e criar array subdimension
                    if( index == -1) {
                        newSkills.push({ 
                            "dimensionName": skill.dimension, 
                            "dimensionId": skill.dimensionId,
                            "subdimensions": [
                                {"subdimensionName": skill.subdimension, 
                                "subdimensionId": skill.subdimensionId,
                                "level": skill.level
                                }
                            ]
                        })
                    } else{
                         //se existir objeto no array skills com a dimensao => adicionar subdimension
                        newSkills[index].subdimensions.push({
                            "subdimensionName": skill.subdimension,
                            "subdimensionId": skill.subdimensionId, 
                            "level": skill.level
                        })
                    } 
                    return newSkills
                }, newSkills = [])
            })

            res.json(result);
        }
    }))
    
})

router.post('/', (req, res) => {
    if(!req.body.name || !req.body.dimensions){
        let error = new Error("Name and Dimensions are required")
        helper.errorHandling(error, res)
    } else {

        let newUser = {
            name: req.body.name,
            dimensions: req.body.dimensions
        };

        getName(newUser.name)
            .then(name => {
                console.log(name)
                if(!name){

                    newUser.dimensions.map((dimension) => {
                        dimension.dimensionId = ObjectId(dimension.dimensionId)
                        dimension.subdimensions.map(subdimension => {
                            subdimension.subdimensionId = ObjectId(subdimension.subdimensionId)
                        })
                    })
            
                    db.get
                        .then(db => db.collection('skills').insertOne(newUser))
                        .then(result => res.json(result))
                        .catch(e => helper.errorHandling(e, res))
                }
                else {
                    helper.errorHandling(new Error('Name already exists'), res)
                }
            })
    }
})



router.post('/alt', (req, res) => {
    //check if name and team are in req body, if not respond with error
    if(!req.body.name || !req.body.team){
        let error = new Error("missing name and team to save")
        helper.errorHandling(error, res);
    } else {
        let reqName = req.body.name.toUpperCase();
        let reqTeam = req.body.team.toUpperCase();
        //let reqLevel = req.body.overall_score.toUpperCase();
        //check if name exist alredy exist in db
        let keys = Object.keys(req.body)
        let teams = []
        let skill = [];
        let newSkill = {};
        let group = {}
        let upAux;
        for(let i = 0; i < keys.length; i++){
            if(keys[i] != "name" && keys[i] != "team"){
                upAux = keys[i].toUpperCase()
                newSkill["subdimension"] = upAux
                newSkill["level"] = req.body[keys[i]].toUpperCase()
                skill.push(newSkill);
                newSkill = Object.assign({})
            }
        }
        group['name'] = reqTeam;
        group['skills'] = skill;
        //group['overall_score'] = reqLevel;
        teams.push(group)
        getName(reqName)
            .then(name => {
                 //if name is not found save new record in db with team and name received
                if(!name){
                    db.get
                        .then(db => db.collection('skills').insertOne({
                            "name": reqName,
                            teams: teams
                        }))
                        .then(result => res.json(result))
                        .catch(e => helper.errorHandling(e, res))
                }else {
                    //if name exist check if team already exist with name
                    getTeam(reqName, reqTeam)
                    .then(team => {
                        //if team does not exist with name in db sabe new team for user
                        if(!team){
                            db.get
                                .then(db => db.collection('skills').update({'name': reqName},
                                                                     { $push: {"teams": group } }
                                                                     
                                                                ))
                                .then(result => res.json(result))
                                .catch(e => helper.errorHandling(e, res))
                        } else {
                        //if team exist replace existing team with new received
                        db.get
                            .then(db => db.collection('skills').update({'name': reqName, "teams.name": reqTeam},
                                                             { $set: {
                                                                 "teams.$.skills": skill }}                                                             
                                                        ))
                            .then(result => res.json(result))
                            .catch(e => helper.errorHandling(e => helper.errorHandling(e, res)))
                        }
                    })
                }           
            })
            .catch(e => helper.errorHandling(e))
    }

});


function getName(name){
    name = new RegExp(name, 'i' )
    return new Promise(function(resolve, reject){
        db.get
        .then(db => db.collection('skills').findOne({'name': name }))
        .then(result => {
            resolve(result)
        })
        .catch(e => reject(e))
    })
}

function checkNameForUpdate(name, id){
    name = new RegExp(name, 'i' )
    return new Promise(function(resolve, reject){
        db.get
        .then(db => db.collection('skills').findOne({ $and: [
            {'name': name },
            {'_id': { $ne: ObjectId(id) }}
        ]}))
        .then(result => {
            resolve(result)
        })
        .catch(e => reject(e))
    })
}


function getTeam(name, team){
    return new Promise(function(resolve, reject){
        db.get
        .then(db => db.collection('skills').findOne( {"name": name, "teams.name": team},
                                                    {'teams.name.$': 1, name: 1 } ))
        .then(result => {
            resolve(result)
        })
        .catch(e => reject(e))
    })
}

function formatResult(results, cb){
    results.map(result => {
        result.teams.map(team => {
            team.skills = team.skills.reduce((acc, item) => {
                acc[item.subdimension] = item.level
                return acc
            },{})
        })
    })
    
    cb(results)
}


module.exports = router;