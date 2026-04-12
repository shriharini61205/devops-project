const express = require('express');
const AWS = require('aws-sdk');

const app = express();

// AWS config
AWS.config.update({
    region: 'ap-southeast-1'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

app.use(express.static(__dirname));

// API from DynamoDB
app.get('/api/products', async (req, res) => {
    const params = {
        TableName: "Products"
    };

    try {
        const data = await dynamo.scan(params).promise();
        res.json(data.Items);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(3000, () => console.log("Server running"));