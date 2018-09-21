const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/apis/routes');
const {port} = require('./config')
const allowCors = require('./cors');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(allowCors);

app.use(routes)

app.listen(port, () =>{
    console.log(`listening on port ${port}`)
})

module.exports = app