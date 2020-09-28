var express = require('express');
var router = express.Router();
var hbsHelpers = require('../helpers/hbs-helpers')

/* GET admin listing. */
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
let findex = hbsHelpers.formatIndex;
  res.render('admin/view-products',{admin:true,products,helpers:{findex}})
});

router.get('/add-products',function(req,res){
  res.render('admin/add-product',{admin:true})
})

router.post('/add-products',(req,res)=>{
  console.log(req.body)
  console.log(req.files.images)
  res.render('admin/add-product')
})

module.exports = router;
