<!DOCTYPE html>

<html>
<head>
<title>Daily Mart</title>

<style>
body { font-family: Arial; margin:0; background:#f1f3f6; }

.header { background:#2874f0; color:white; padding:15px; display:flex; justify-content:space-between; }

#products {
 display:grid;
 grid-template-columns:repeat(5,1fr);
 gap:20px;
 padding:20px;
}

.card { background:white; padding:10px; text-align:center; border-radius:10px; }

.card img { width:100%; height:140px; object-fit:cover; }

.cart-bar {
 position:fixed;
 bottom:0;
 width:100%;
 background:white;
 padding:15px;
 text-align:center;
}
</style>

</head>

<body>

<div id="app"></div>

<script>
let cart = {};

showProducts();

function showProducts(){
 document.getElementById('app').innerHTML = `
 <div class="header">
   <h2>Daily Mart</h2>
   <button onclick="goToCart()">Cart</button>
 </div>
 <div id="products"></div>
 <div class="cart-bar">
   Total: ₹<span id="total">0</span>
 </div>
 `;

 fetch('/api/products')
 .then(res=>res.json())
 .then(data=>{
   let container=document.getElementById('products');
   data.forEach(p=>{
     let div=document.createElement('div');
     div.className="card";
     div.innerHTML=`
     <img src="/images/${p.image}">
     <h4>${p.name}</h4>
     <p>₹${p.price}</p>
     <button onclick="add('${p.id}','${p.name}',${p.price})">Add</button>
     `;
     container.appendChild(div);
   });
 });
}

function add(id,name,price){
 if(!cart[id]) cart[id]={name,price,qty:0};
 cart[id].qty++;
 updateTotal();
}

function updateTotal(){
 let total=0;
 for(let id in cart){
   total+=cart[id].price*cart[id].qty;
 }
 document.getElementById('total').innerText=total;
}

function goToCart(){
 let total=0;

 let html=`<div class="header">
 <h2>Cart</h2>
 <button onclick="showProducts()">Back</button>
 </div>

 <div style="padding:20px;font-family:monospace;"><pre>
Product Name        Qty     Price
--------------------------------
`;

 for(let id in cart){
   let item=cart[id];
   let t=item.price*item.qty;
   total+=t;

   html+=`${item.name.padEnd(20)} ${item.qty.toString().padEnd(6)} ${t}\n`;
 }

 html+=`--------------------------------
Total Amount = ${total}
--------------------------------
</pre>

<button onclick="placeOrder()">Place Order</button>

</div>`;

document.getElementById('app').innerHTML=html;
}

function placeOrder(){
fetch('/api/order',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({cart})
})
.then(res=>{
if(!res.ok) throw new Error();
return res.json();
})
.then(data=>{
alert("✅ Order placed successfully!");
cart={};
showProducts();
})
.catch(()=>{
alert("❌ Order failed");
});
} </script>

</body>
</html>
