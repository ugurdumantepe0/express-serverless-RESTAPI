const config = require('config-yml');
var Ajv = require('ajv');
const getRecords = require('./dbHelper').getRecords; 

const apiResponses = config.responses;

const validateBody = (req, res, next) => {

    // predefined json schema for request body
    var schema = {
      "properties": {
        "startDate": {"type": "string", "format": "date"},
        "endDate": {"type": "string", "format": "date"},
        "minCount": {"type": "number", "minimum":0},
        "maxCount": {"type": "number"}
      },

      "required": ["startDate", "endDate", "minCount", "maxCount"]
   };
    var ajv = new Ajv();
    var validate= ajv.compile(schema);
    var valid = validate(req.body);
    if(!valid) {
        console.log(ajv.errors);
        res.json(apiResponses.validationFail);
    }

    else {
        next();
    }
};

// send he request with the valid body
const sendRequest = (req, res) => {
    const params = req.body;
    getRecords(params)
        .then(
            (records) => {
                const response = apiResponses.success;
                response.records = records;
                res.json(response); 
            }
        )
        .catch(
            (error) => {
                // Respond with a generic error message, need to see logs for more details.
                const response = apiResponses.getRecordsFail; 
                res.json(response); 
                console.log(error);
            }
        );
};


module.exports = {
    validateBody,
    sendRequest
};