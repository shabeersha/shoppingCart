const { response } = require('express');
var express = require('express');
const { Db } = require('mongodb');
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
    let imageFile=req.files.Images
    imageFile.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect('/admin/add-products')
      }else{
        console.log(err)
      }
    })
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})
router.get('/edit-product/:id',async (req,res)=>{
  let product = await productHelpers.getProductDetails(req.params.id)

  console.log(product);
  res.render('admin/edit-product',{admin:true,product})
})

router.post('/edit-products/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let id = req.params.id
    res.redirect('/admin')
    if(req.files.Images){
      let imageFile=req.files.Images
      imageFile.mv('./public/product-images/'+id+'.jpg')
    }
  })
})

module.exports = router;
