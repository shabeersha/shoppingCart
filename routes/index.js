var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let products = [{
    name:"iphone 11",
    description:"Iphone 11 (64GB BLACK)",
    image:"https://images-na.ssl-images-amazon.com/images/I/51kGDXeFZKL._SX522_.jpg",
    category:"Mobile"
  },
  {
    name:"Samsung A70s",
    description:"Samsung A70s (128GB INDIGO)",
    image:"https://images-na.ssl-images-amazon.com/images/I/61jkp2mBnqL._SX522_.jpg",
    category:"Mobile"
  },
  {
    name:"Macbook Pro Air",
    description:"Apple Macbook Pro Air ",
    image:"https://images-na.ssl-images-amazon.com/images/I/71Ae0NSObSL._SX522_.jpg",
    category:"Laptop"
  },
  {
    name:"Apple Ipad Air 2",
    description:"Apple Ipad Air 2",
    image:"https://images-na.ssl-images-amazon.com/images/I/718pwrPBjcL._SX522_.jpg",
    category:"Tablet"
  }
]
  res.render('index', { products,admin:false });
});

module.exports = router;
