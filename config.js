const cfenv = require('cfenv'); 
const appenv = cfenv.getAppEnv(); 
const env = process.env.NODE_ENV.trim();
let dbhost;
let options;

switch(env){
    case 'dev':
        dbhost = "mongodb://localhost:27017/skill"
        options = {}
        break;
    case 'production':
        dbhost = 'mongodb://walter_cantori:shioncdz19!@cluster0-shard-00-00-u0ese.mongodb.net:27017,cluster0-shard-00-01-u0ese.mongodb.net:27017,cluster0-shard-00-02-u0ese.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'
        options = {}
        break;
    case 'test':
        dbhost = "mongodb://localhost:27017/skill_test"
        options = {}
        break;
    // case 'production':
    //     let services = appenv.services; //compose
    //     let mongodb_services = services["compose-for-mongodb"]; //compose
    //     let credentials = mongodb_services[0].credentials; //compose
    //     let ca = [new Buffer(credentials.ca_certificate_base64, 'base64')]; //compose
    //     dbhost = credentials.uri
    //     options = { ssl: true,
    //         sslValidate: true,
    //         sslCA: ca,
    //         poolSize: 10,
    //         reconnectTries: 1,
    //         socketTimeoutMS: 100000,
    //         connectTimeoutMS: 100000
    //     }
    //     break;
}



module.exports = {
    dbhost,
    options,
    port: appenv.port
}
