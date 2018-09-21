var schema = require('validate');

function validateProject(project){
    var projectValidade = schema({
        projectID: {
            type: 'string',
            required: true,
            message: 'Project ID is required.'
        },
        projectName: {
            type: 'string',
            required: true,
            message: 'Project ID is required.'
        },
        pmt: {
            type: 'number',
            required: true,
            message: 'PMT NUmber is required.'
        },
        projectRelease: {
            type: 'string',
            required: true,
            message: 'Project Release is required.'
        },
        pmName: {
            type: 'string',
            required: true,
            message: 'pmName is required.'
        },
        pmEmail: {
            type: 'string',
            required: true,
            match:  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: 'pmEmail must be valid.'
        },
        taName: {
            type: 'string',
            required: true,
            message: 'taName  is required..'
        },
        taEmail: {
            type: 'string',
            required: true,
            match:  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: 'taEmail must be valid.'
        },
        description: {
            type: 'string',
            required: true,
            message: 'description  is required..'
        },
        progress: {
            type: 'string',
            required: true,
            match: /^(green|yellow|red)$/,
            message: 'End Date must be valid'
        }
    })
    return projectValidade.validate(project);
}

module.exports = {
    validateProject: validateProject 
}