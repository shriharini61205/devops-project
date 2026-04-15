const express = require('express');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());

// ✅ Serve static files (images + html)
app.use(express.static(__dirname));

// ✅ AWS Region (Singapore)
AWS.config.update({ region: 'ap-southeast-1' });

const dynamo = new AWS.DynamoDB.DocumentClient();

/* PRODUCTS API */
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

    // ✅ FIXED: send clean JSON
    res.json(products);
});

/* SAVE ORDER */
app.post('/api/order', async (req, res) => {

    const cart = req.body.cart;
    const orderId = Date.now().toString();

    let total = 0;

    for (let id in cart) {
        total += cart[id].price * cart[id].qty;
    }

    const params = {
        TableName: "Orders",
        Item: {
            id: orderId, // ✅ primary key
            cart: cart,
            total: total,
            createdAt: new Date().toISOString()
        }
    };

    try {
        await dynamo.put(params).promise();
        res.json({ message: "Order saved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save order" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));