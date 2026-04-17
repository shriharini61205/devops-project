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

/* TEST */
app.get('/test', (req, res) => {
    res.json({ message: "Server working" });
});

/* PRODUCTS */
app.get('/api/products', (req, res) => {
    res.json([
        { id: "1", name: "Milk", price: 35 },
        { id: "2", name: "Bread", price: 50 },
        { id: "3", name: "Pizza", price: 200 },
        { id: "4", name: "Banana", price: 20 }
    ]);
});

/* ORDER */
app.post('/api/order', async (req, res) => {

    const { cart, user } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ error: "Cart empty" });
    }

    const orderId = Date.now().toString();

    let items = [];
    let total = 0;

    for (let item of cart) {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        items.push({
            name: item.name,
            qty: item.qty,
            price: item.price,
            itemTotal: itemTotal
        });
    }

    const params = {
        TableName: "Orders",
        Item: {
            id: orderId,
            user: user,
            items: items,
            total: total
        }
    };

    try {
        await dynamo.put(params).promise();

        res.json({
            message: "Order stored",
            orderId: orderId
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running");
});