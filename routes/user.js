const { log } = require('debug');
const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers =require('../helpers/userHelpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    
    next();
  }else{
    
    res.redirect('/login')
  }
}


/* GET home page. */
router.get('/',async function(req, res) {
  let user = req.session.user
  let cartCount = null
  if(req.session.user){
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products', { products,user,cartCount});
  })
});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{loginErr:req.session.loginErr})
    req.session.loginErr = false
  }
})


router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid Username or Password"
      res.redirect('/login')
    }
  })
})


router.get('/signup',(req,res)=>{
  res.render('user/signup')
})


router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log("New user created",response);
    res.redirect('/login')
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let user = req.session.user
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let cartProducts = await userHelpers.getCartProducts(req.session.user._id)
  console.log(cartProducts);
  
  res.render('user/cart',{user,cartProducts,cartCount})
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{

  userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
    
    res.json({status:true})
  })

})


router.post('/change-product-quantity',(req,res)=>{
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    res.json(response)
  })
})


router.get('/place-order',verifyLogin,async (req,res)=>{
  let total= await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total})
})


module.exports = router;
