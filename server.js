const express = require('express');
const AWS = require('aws-sdk');

const app = express();   // ✅ create app FIRST

app.use(express.json()); // ✅ now valid

// AWS config
AWS.config.update({
    region: 'ap-southeast-1'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

app.use(express.static(__dirname));

// GET products
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

// POST order
app.post('/api/order', async (req, res) => {
    const params = {
        TableName: "Orders",
        Item: {
            orderId: Date.now().toString(),
            items: req.body.cart,
            total: req.body.total
        }
    };

    try {
        await dynamo.put(params).promise();
        res.send("Order saved");
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));