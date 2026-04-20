const express = require('express');
const AWS = require('aws-sdk');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));
app.use('/images', express.static(__dirname + '/images'));

AWS.config.update({
    region: 'ap-southeast-1'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

/* PRODUCTS */
app.get('/api/products', (req, res) => {
    res.json(require('./products.json')); // better to store separately
});

/* ORDER */
app.post('/api/order', async (req, res) => {
    try {
        const { cart, user } = req.body;

        if (!cart || Object.keys(cart).length === 0) {
            return res.status(400).json({ error: "Cart empty" });
        }

        const orderId = Date.now().toString();

        let items = [];
        let total = 0;

        for (let id in cart) {
            let i = cart[id];
            let t = i.price * i.qty;
            total += t;

            items.push({
                name: i.name,
                qty: i.qty,
                price: i.price,
                total: t
            });
        }

        await dynamo.put({
            TableName: "Orders",
            Item: {
                id: orderId,
                user,
                items,
                total,
                createdAt: new Date().toISOString()
            }
        }).promise();

        res.json({ orderId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
});