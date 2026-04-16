const express = require('express');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// AWS Region
AWS.config.update({ region: 'ap-southeast-1' });

const dynamo = new AWS.DynamoDB.DocumentClient();

/* PRODUCTS */
app.get('/api/products', (req, res) => {
    const products = [
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
    ];

    res.json(products);
});

/* ORDER API (FIXED & SAFE) */
app.post('/api/order', async (req, res) => {

    const { cart, user } = req.body;

    if (!cart || Object.keys(cart).length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const orderId = Date.now().toString();

    let items = [];
    let total = 0;

    for (let id in cart) {
        const item = cart[id];

        const itemTotal = item.price * item.qty;
        total += itemTotal;

        items.push({
            id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            itemTotal
        });
    }

    const params = {
        TableName: "Orders",
        Item: {
            id: orderId,
            items: items,
            total: total,
            user: user || {},
            status: "PENDING",
            createdAt: new Date().toISOString()
        }
    };

    try {
        await dynamo.put(params).promise();
        res.json({
            message: "Order saved successfully",
            orderId: orderId
        });
    } catch (err) {
        console.error("DynamoDB Error:", err);
        res.status(500).json({ error: "Failed to save order" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));