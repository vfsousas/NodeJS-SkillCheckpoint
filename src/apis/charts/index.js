const express = require('express');
const router = express.Router();
const helper = require('../helpers');
const db = require('../../data/db')
const ObjectId = require('mongodb').ObjectID

const _level = ['null', 'entry', 'foundation', 'experienced', 'expert', 'thought leader' ]

router.get('/radar', (req, res) => {
    if(!req.query.name){
        helper.errorHandling(new Error('Name is a required information'), res)
    } else if(!req.query.dimension){
        db.get
        .then(db => db.collection('skills').aggregate([
            {$match: {name: req.query.name}},
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
                                {"name": skill.subdimension, 
                                "subdimensionId": skill.subdimensionId,
                                "level": skill.level,
                                "weight": _level.indexOf(skill.level.toLowerCase()) == -1 ?  0 : _level.indexOf(skill.level.toLowerCase())
                                }
                            ]
                        })
                    } else{
                         //se existir objeto no array skills com a dimensao => adicionar subdimension
                        newSkills[index].subdimensions.push({
                            "name": skill.subdimension, 
                            "level": skill.level,
                            "weight": _level.indexOf(skill.level.toLowerCase()) == -1 ?  0 : _level.indexOf(skill.level.toLowerCase())
                        })
                    } 
                    return newSkills
                }, newSkills = [])
            })
            res.json([result[0].dimensions[0]]);
        }
    }))


        
    } else {
        let name = req.query.name
        let dimension = req.query.dimension

        getDimensionId(dimension, res)
            .then(dimension => {
                if(dimension){
                    db.get
                    .then(db => db.collection('skills').aggregate([
                        {$match: {'name': name} },
                        {$unwind : '$dimensions'},
                        {$match: {'dimensions.dimensionId': ObjectId(dimension)} },
                        {$unwind : '$dimensions.subdimensions'},
                        {$lookup: {
                            from: 'subdimension',
                            localField: 'dimensions.subdimensions.subdimensionId',
                            foreignField: '_id', 
                            as: 'subdimensionInfo',
                        }},
                        {$project: {
                            _id: 0,
                            name: 1,
                            subdimensionName: {$arrayElemAt: [ '$subdimensionInfo.name', 0 ]},
                            subdimensionLevel: '$dimensions.subdimensions.level'
                        }},
                        {$group: 
                            {
                                _id: {name: '$name'},
                                subdimensions: {$push: {name: '$subdimensionName', level: '$subdimensionLevel'}}
                            }
                        },
                        {$project: {
                            name: '$_id.name',
                            subdimensions: 1,
                            _id:0
                        }}], function(error, result){
                        if(error) helper.errorHandling(error, res)
                        else {
                            if(result[0]){
                                result[0].subdimensions.map(subdimension => {
                                    subdimension.weight = _level.indexOf(subdimension.level.toLowerCase()) == -1 ?  0 : _level.indexOf(subdimension.level.toLowerCase())
                                })
                                res.json(result)
                            }
                            else{
                                helper.errorHandling(new Error('Dimension not found for name in the request'), res)
                            }
                            
                        }
                    
                    }))    
                }else {
                    helper.errorHandling(new Error('Dimension not found for name in the request'), res)
                }            
            })
            .catch(e => helper.errorHandling(e, res))
    }
});


router.get('/pizza', (req, res) => {
    if(req.query.dimension == 'all'){


        db.get
        .then(db => db.collection('skills').aggregate([
            {$unwind : '$dimensions'},
            {$unwind: '$dimensions.subdimensions'},
            {$group: {
                _id: {name: '$dimensions.subdimensions.level'},
                count: {$sum: 1}
            }},
            {$project: {
                _id: 0,
                level: '$_id.name',
                count: 1,
            }},
        ], function(error, result){
            if(error) helper.errorHandling(error, res)
            else {
                let response = [{}]
                response[0].subdimension = req.query.subdimension
                response[0].geo = req.query.geo || ''
                response[0].overallLevel = result

                currentLevels = []
                response[0].overallLevel.map(level => {
                    currentLevels.push(level.level)
                })

                _level.map(level => {
                    if( currentLevels.indexOf(level.toUpperCase() ) == -1 ) {
                        response[0].overallLevel.push({"level": level.toUpperCase(), "count": 0})
                    }
                })

                res.json(response)
            }
        }))


    } else{

        if(!req.query.subdimension){
            helper.errorHandling(new Error('Subdimension is required information'), res)
        } else {
            let subdimension = req.query.subdimension

            getSubDimensionId(subdimension, res)
                .then(subdimension => {
                    db.get
                    .then(db => db.collection('skills').aggregate([
                        {$unwind : '$dimensions'},
                        {$unwind: '$dimensions.subdimensions'},
                        {$match: {'dimensions.subdimensions.subdimensionId' : ObjectId(subdimension) }},
                        {$group: {
                            _id: {name: '$dimensions.subdimensions.level'},
                            count: {$sum: 1}
                        }},
                        {$project: {
                            _id: 0,
                            level: '$_id.name',
                            count: 1,
                        }},
                    ], function(error, result){
                        if(error) helper.errorHandling(error, res)
                        else {
                            let response = [{}]
                            response[0].subdimension = req.query.subdimension
                            response[0].geo = req.query.geo || ''
                            response[0].overallLevel = result

                            currentLevels = []
                            response[0].overallLevel.map(level => {
                                currentLevels.push(level.level)
                            })

                            _level.map(level => {
                                if( currentLevels.indexOf(level.toUpperCase() ) == -1 ) {
                                    response[0].overallLevel.push({"level": level.toUpperCase(), "count": 0})
                                }
                            })

                            res.json(response)
                        }
                    }))

                })
                .catch(e => helper.errorHandling(e, res))
        }
    }
})

function getDimensionId(name, res){
    return new Promise((resolve, reject) =>{
        db.get
        .then( db => db.collection('dimension').findOne( {'name': name}, {_id: 1} ) )
        .then( dimension => {
            if(dimension){
                resolve(dimension._id)
            } else {
                resolve(null)
            }            
        })
        .catch( e => reject(e))
    })
}

function getSubDimensionId(name, res){
    return new Promise((resolve, reject) =>{
        db.get
        .then( db => db.collection('subdimension').findOne( {'name': name}, {_id: 1} ) )
        .then( subdimension => {
            if(subdimension) resolve(subdimension._id) 
            else res.json({result: "Data not found for subdimension"})
        })
        .catch( e => reject(e))
    })
}

module.exports = router