var express = require('express');
var router = express.Router();
var hbsHelpers = require('../helpers/hbs-helpers')
var productHelpers = require('../helpers/product-helpers')


/* GET admin listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{

    let findex = hbsHelpers.formatIndex;
    res.render('admin/view-products',{admin:true,products,helpers:{findex}})

  })
});

router.get('/add-products',function(req,res){
  res.render('admin/add-product',{admin:true})
})

router.post('/add-products',(req,res)=>{
 
  productHelpers.addProduct(req.body,(id)=>{
    let imageFile=req.files.images
    imageFile.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product')
      }else{
        console.log(err)
      }
    })
  })
})

module.exports = router;
