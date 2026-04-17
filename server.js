const express = require('express');
const AWS = require('aws-sdk');

const app = express();

/* MIDDLEWARE */
app.use(express.json());
app.use(express.static(__dirname));
app.use('/images', express.static(__dirname + '/images'));

/* AWS CONFIG */
AWS.config.update({
    region: 'ap-southeast-1'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

/* TEST */
app.get('/test', (req, res) => {
    res.json({ message: "Server working 🚀" });
});

/* PRODUCTS API */
app.get('/api/products', (req, res) => {
    res.json([
        { id: "1", name: "Milk", price: 35 },
        { id: "2", name: "Bread", price: 50 },
        { id: "3", name: "Pizza", price: 200 },
        { id: "4", name: "Banana", price: 20 },
        { id: "5", name: "Biscuit", price: 30 },
        { id: "6", name: "Perfume", price: 300 },
        { id: "7", name: "Chocolate", price: 150 },
        { id: "8", name: "Apple", price: 150 },
        { id: "9", name: "Notebook", price: 60 },
        { id: "10", name: "Shoes", price: 200 }
    ]);
});

/* ORDER API */
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
            total: total,
            createdAt: new Date().toISOString()
        }
    };

    try {
        await dynamo.put(params).promise();

        res.json({
            message: "Order stored successfully",
            orderId: orderId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/* START SERVER */
app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 Server running on port 3000");
});