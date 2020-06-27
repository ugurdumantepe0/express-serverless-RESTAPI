const mongoClient = require('mongodb').MongoClient;

// Read database URL from environment
const url = process.env.dbURL;

const getRecords = (params) => {
    return new Promise((resolve, reject) => {
        getDatabase()
            .then((client) => {
                const db = client.db();
                const records = db.collection('records');
                const aggregations = getAggregations(params);

                records.aggregate(aggregations).toArray((error, result) => {
                    if (!error && result) {
                        resolve(result);
                    } else {
                        console.log(error);
                        reject('getRecords failed');
                    }
                    client.close();
                });
            })
            .catch(error => reject(error));
    });
};

// Get the database client with successful connection
const getDatabase = () => {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject('MongoDb URL is invalid');
            return;
        }
        mongoClient.connect(url, (clientError, client) => {
            if (!clientError && client) {
                console.log('MongoDb connection successful');
                resolve(client);
            } else {
                console.log(clientError);
                reject(`MongoDb connection failed for URL: ${url}`);
            }
        });
    });
};

// Aggregations defined for MongoDB's Aggregation Pipeline
const getAggregations = (params) => {
    return [{
        $addFields: {
            totalCount: {
                $sum: "$counts"
            }
        }
    },
    {
        $project: {
            _id: 0,
            key: 1,
            createdAt: 1,
            totalCount: 1
        }
    },
    {
        $match: {
            createdAt: {
                $gte: new Date(params.startDate),
                $lte: new Date(params.endDate)
            },
            totalCount: {
                $gte: params.minCount,
                $lte: params.maxCount
            }
        }
    }];
};

module.exports = {
    getRecords
};