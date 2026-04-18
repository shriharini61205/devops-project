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
    res.json({ message: "Server is working fine 🚀" });
});

/* PRODUCTS API */
app.get('/api/products', (req, res) => {
    res.json([

        // 🍎 FRUITS
        { id:"1", name:"Banana", price:20, category:"fruits", image:"fruits/banana.jpg" },
        { id:"2", name:"Apple", price:150, category:"fruits", image:"fruits/apple.jpg" },
        { id:"3", name:"Mango", price:120, category:"fruits", image:"fruits/mango.jpg" },
        { id:"4", name:"Orange", price:80, category:"fruits", image:"fruits/orange.jpg" },
        { id:"5", name:"Grapes", price:90, category:"fruits", image:"fruits/grapes.jpg" },
        { id:"6", name:"Pineapple", price:70, category:"fruits", image:"fruits/pineapple.jpg" },
        { id:"7", name:"Papaya", price:60, category:"fruits", image:"fruits/papaya.jpg" },
        { id:"8", name:"Watermelon", price:50, category:"fruits", image:"fruits/watermelon.jpg" },
        { id:"9", name:"Kiwi", price:200, category:"fruits", image:"fruits/kiwi.jpg" },
        { id:"10", name:"Guava", price:40, category:"fruits", image:"fruits/guava.jpg" },

        // 🛒 GROCERY
        { id:"11", name:"Milk", price:35, category:"grocery", image:"grocery/milk.jpg" },
        { id:"12", name:"Mushroom", price:50, category:"grocery", image:"grocery/mushroom.jpg" },
        { id:"13", name:"Oats", price:60, category:"grocery", image:"grocery/oats.jpg" },
        { id:"14", name:"Oil", price:120, category:"grocery", image:"grocery/oil.jpg" },
        { id:"15", name:"Sugar", price:45, category:"grocery", image:"grocery/sugar.jpg" },
        { id:"16", name:"Salt", price:20, category:"grocery", image:"grocery/salt.jpg" },
        { id:"17", name:"Tea", price:150, category:"grocery", image:"grocery/tea.jpg" },
        { id:"18", name:"Coffee", price:200, category:"grocery", image:"grocery/coffee.jpg" },
        { id:"19", name:"Panner", price:30, category:"grocery", image:"grocery/panner.jpg" },
        { id:"20", name:"Wheat", price:40, category:"grocery", image:"grocery/wheat.jpg" },

        // 🍪 SNACKS
        { id:"21", name:"Chips", price:20, category:"snacks", image:"snacks/chips.jpg" },
        { id:"22", name:"Cookies", price:40, category:"snacks", image:"snacks/cookies.jpg" },
        { id:"23", name:"Popcorn", price:50, category:"snacks", image:"snacks/popcorn.jpg" },
        { id:"24", name:"Nachos", price:60, category:"snacks", image:"snacks/nachos.jpg" },
        { id:"25", name:"Chocolate", price:80, category:"snacks", image:"snacks/chocolate.jpg" },
        { id:"26", name:"Cupcake", price:70, category:"snacks", image:"snacks/cupcake.jpg" },
        { id:"27", name:"Donut", price:60, category:"snacks", image:"snacks/donut.jpg" },
        { id:"28", name:"Burger", price:120, category:"snacks", image:"snacks/burger.jpg" },
        { id:"29", name:"Pizza", price:150, category:"snacks", image:"snacks/pizza.jpg" },
        { id:"30", name:"Fries", price:90, category:"snacks", image:"snacks/fries.jpg" },

        // 🌶️ SPICES
        { id:"31", name:"Turmeric", price:30, category:"spices", image:"spices/turmeric.jpg" },
        { id:"32", name:"Chili Powder", price:40, category:"spices", image:"spices/chili.jpg" },
        { id:"33", name:"Coriander", price:35, category:"spices", image:"spices/coriander.jpg" },
        { id:"34", name:"Cumin", price:50, category:"spices", image:"spices/cumin.jpg" },
        { id:"35", name:"Garam Masala", price:60, category:"spices", image:"spices/garammasala.jpg" },
        { id:"36", name:"Pepper", price:70, category:"spices", image:"spices/pepper.jpg" },
        { id:"37", name:"Mustard", price:25, category:"spices", image:"spices/mustard.jpg" },
        { id:"38", name:"Cardamom", price:120, category:"spices", image:"spices/cardamom.jpg" },
        { id:"39", name:"Cloves", price:110, category:"spices", image:"spices/cloves.jpg" },
        { id:"40", name:"Cinnamon", price:90, category:"spices", image:"spices/cinnamon.jpg" }

    ]);
});

/* ORDER API */
app.post('/api/order', async (req, res) => {
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
                itemTotal
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
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

/* SERVER */
app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 Server running on port 3000");
});