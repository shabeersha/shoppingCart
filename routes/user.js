const { log } = require('debug');
const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers =require('../helpers/userHelpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    
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
  if(req.session.userLoggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{loginErr:req.session.userLoginErr})
    req.session.loginErr = false
  }
})


router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.userLoggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.userLoginErr="Invalid Username or Password"
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
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let user = req.session.user
  
  
  let cartCount = await userHelpers.getCartCount(user._id)
  let cartProducts = await userHelpers.getCartProducts(user._id)
  totalValue=await userHelpers.getTotalAmount(user._id)
  console.log(cartProducts);
  
  res.render('user/cart',{user,cartProducts,cartCount,totalValue})
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{

  userHelpers.addToCart(req.params.id,req.session.user._id).then(async(response)=>{
    response.cartCount = await userHelpers.getCartCount(req.session.user._id)
    res.json(response)
  })

})


router.post('/change-product-quantity',(req,res)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.userId)
    
    res.json(response)
  })
})


router.get('/place-order',verifyLogin,async (req,res)=>{
  console.log(req.session.user._id)
  let total= await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})

router.post('/place-order',async(req,res)=>{
  
  let products=await userHelpers.getCartProductsList(req.body.userId)
  
  let totalPrice= await userHelpers.getTotalAmount(req.body.userId)
  
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        
        res.json(response)
      })
    }
    
  })
  

})

router.get('/order-success',((req,res)=>{

  res.render('user/order-success',{user:req.session.user})

}))

router.get('/orders',verifyLogin,(async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
}))

router.get('/view-order-products/:id',verifyLogin,(async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
   
  res.render('user/view-order-products',{user:req.session.user,products})
}))

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);

userHelpers.verifyPayment(req.body).then((response)=>{
  userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
    console.log("payment Success");
    res.json({status:true})
  })

}).catch((err)=>{
  console.log(err);
  res.json({status:false})
})

})


module.exports = router;
