var schema = require('validate');

function validateProject(project){
    var projectValidade = schema({
        name: {
            type: 'string',
            required: true,
            message: 'Name is required.'
        },
        description: {
            type: 'string',
            required: true,
            message: 'Description is required.'
        },
        status: {
            type: 'string',
            required: true,
            match: /^(Active|On Hold)$/,
            message: 'status required.'
        }
    })
    return projectValidade.validate(project);
}

module.exports = {
    validateProject: validateProject 
}