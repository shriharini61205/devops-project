const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');

const app = express();

/* MIDDLEWARE */
app.use(express.json());

// 🔥 FIX: Serve static files properly (IMPORTANT FOR IMAGES)
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));

/* AWS CONFIG */
AWS.config.update({
    region: 'ap-southeast-1'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

/* TEST ROUTE */
app.get('/test', (req, res) => {
    res.json({ message: "Server is working fine 🚀" });
});

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

    res.json(products);
});

/* ORDER API */
app.post('/api/order', async (req, res) => {
    console.log("📦 ORDER API HIT");
    console.log("BODY:", req.body);

    const { cart, user } = req.body;

    if (!cart || Object.keys(cart).length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const orderId = Date.now().toString();

    let items = [];
    let total = 0;

    // 🔥 CLEAN ITEM STRUCTURE
    for (let id in cart) {
        const item = cart[id];

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
            items: items,
            total: total,
            user: user || {},
            status: "PENDING",
            createdAt: new Date().toISOString()
        }
    };

    try {
        console.log("💾 Saving to DynamoDB...");
        await dynamo.put(params).promise();

        console.log("✅ Order saved successfully!");

        res.json({
            message: "Order saved successfully",
            orderId: orderId
        });

    } catch (err) {
        console.error("❌ FULL DYNAMODB ERROR:", JSON.stringify(err, null, 2));

        res.status(500).json({
            error: "Failed to save order",
            details: err.message
        });
    }
});

/* START SERVER */
app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 Server running on port 3000");
});