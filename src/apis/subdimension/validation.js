var schema = require('validate');

function validateSubDimension(subDimension){
    var subDimensionValidate = schema({
        name: {
            type: 'string',
            required: true,
            message: 'name ID is required.'
        },
        description: {
            type: 'string',
            required: true,
            message: 'description ID is required.'
        },
        status: {
            type: 'string',
            required: true,
            message: 'status ID is required.'
        },
        dimensionId: {
            type: 'string',
            required: true,
            message: 'dimension ID is required.'
        },
    })
    return subDimensionValidate.validate(subDimension);
}

module.exports = { validateSubDimension }