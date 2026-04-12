app.use(express.json());

// Save order
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