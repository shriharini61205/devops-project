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

/* TEST API */
app.get('/test', (req, res) => {
res.json({ message: "Server is working fine 🚀" });
});

/* PRODUCTS API */
app.get('/api/products', (req, res) => {
res.json([
{ id:"1", name:"Banana", price:20, image:"fruits/banana.jpg" },
{ id:"2", name:"Apple", price:150, image:"fruits/apple.jpg" }
]);
});

/* ORDER API */
app.post('/api/order', async (req, res) => {

```
try {
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
            user: user || {},
            items: items,
            total: total,
            createdAt: new Date().toISOString()
        }
    };

    await dynamo.put(params).promise();

    res.json({
        message: "Order placed successfully",
        orderId: orderId
    });

} catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
}
```

});

/* SERVER */
app.listen(3000, "0.0.0.0", () => {
console.log("🚀 Server running on port 3000");
});
