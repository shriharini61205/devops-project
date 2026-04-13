const express = require('express');
const AWS = require('aws-sdk');

const app = express();

app.use(express.json());
app.use(express.static('.'));

/* AWS CONFIG (Singapore) */
AWS.config.update({
    region: 'ap-southeast-1'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

/* PRODUCTS */
app.get('/api/products', (req, res) => {

    const products = [
        { id: "1", name: "Milk", price: 20 },
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

/* WHATSAPP MESSAGE */
function formatWhatsAppMessage(cart, total, orderId) {
    let message = "🛒 Order Details from Ecommerce World\n\n";

    for (let id in cart) {
        const item = cart[id];
        message += `${item.name} (${item.qty}) = ${item.price * item.qty}\n`;
    }

    message += "----------------\n";
    message += `Total = ${total}\n`;
    message += `Order ID: ${orderId}\n`;
    message += "----------------";

    return encodeURIComponent(message);
}

/* PLACE ORDER */
app.post('/api/order', async (req, res) => {

    try {
        const cart = req.body.cart || {};
        const phone = req.body.phone;

        if (!phone) {
            return res.status(400).json({ error: "Phone number required" });
        }

        if (Object.keys(cart).length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const orderId = Date.now().toString();
        let total = 0;

        for (let id in cart) {
            total += cart[id].price * cart[id].qty;
        }

        /* SAVE IN DYNAMODB */
        const params = {
            TableName: "Orders",
            Item: {
                id: orderId,
                phone: phone,
                cart: JSON.stringify(cart),
                total: total,
                createdAt: new Date().toISOString()
            }
        };

        await dynamo.put(params).promise();

        console.log("✅ Order saved:", params.Item);

        /* WHATSAPP */
        const phoneNumber = "91" + phone;
        const message = formatWhatsAppMessage(cart, total, orderId);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        res.json({
            message: "Order saved successfully",
            orderId,
            total,
            whatsappUrl
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* START SERVER */
app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});