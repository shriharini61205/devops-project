const getProducts = (req, res) => {
  const products = [
    { id: 1, name: "Laptop", price: 50000 },
    { id: 2, name: "Phone", price: 20000 },
  ];

  res.json(products);
};

module.exports = { getProducts };