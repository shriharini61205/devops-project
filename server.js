const express = require('express');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());
app.use(express.static('.'));

AWS.config.update({ region: 'ap-south-1' });

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

    res.json(products.map(p => ({
        id: JSON.stringify(p)
    })));
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
            orderId: orderId,
            cart: cart,
            total: total,
            createdAt: new Date().toISOString()
        }
    };

    try {
        await dynamo.put(params).promise();

        console.log("Saved:", params.Item);

        res.json({ message: "Order saved" });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed" });
    }
});

app.listen(3000, () => console.log("Server running"));