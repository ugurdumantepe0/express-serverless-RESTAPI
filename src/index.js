const app = require('express')();
const config = require('config-yml');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const controller = require('./controller');

// const port = process.env.PORT || 80 || 8080;


app.use(bodyParser.json());

app.post('/getResults',
    [
        controller.validateBody,
        controller.sendRequest
    ]
);

module.exports.handler = serverless(app);