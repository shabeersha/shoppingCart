const collections = require('../config/collections')
db=require('../config/connection')
const bcrypt=require('bcrypt')
const { ObjectID } = require('mongodb')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
const Razorpay = require('razorpay')

var instance = new Razorpay({
    key_id: 'rzp_test_PJV8XIlAVTQAnq',
    key_secret: 'XVjjy30VpLq0W0ulMqaK7nEQ',
  });

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password = await bcrypt.hash(userData.Password,10)
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.ops[0])
            })

        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
              let loginStatus=false
              let response ={}
            let user=await db.get().collection(collections.USER_COLLECTION).findOne({Email:userData.Email})

            console.log("user data")
            console.log(user._id)
            console.log("user data End")

            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("Login Success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    }else{
                        console.log("Login Failed , Incorrect Password")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("Login Failed, User Not Found")
                resolve({status:false})
            }
        })
    },
    addToCart:(proId,userId)=>{

        proObj={
            item:objectId(proId),
            quantity:1
        }
        
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})

            if(userCart){
                let proExist = userCart.products.findIndex(product=>product.item==proId)
                console.log(proExist)
                if(proExist!=-1){
                    db.get().collection(collections.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item':objectId(proId)},{
                        $inc:{'products.$.quantity':1}
                    }
                        ).then(()=>{
                            resolve({status:true})
                        })
                }else{
                db.get().collection(collections.CART_COLLECTION)
                .updateOne({user:objectId(userId)},
                    {
                        $push:{
                            products:proObj
                        }

                    }
                ).then((response)=>{
                    resolve({status:true})
                })
            }

            }else{
                let cartObj ={
                    user:objectId(userId),
                    products:[proObj ]
                }

                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve({status:true})
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },{
                    $unwind:'$products'
                },{
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },{
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },{
                    $project:{item:1,quantity:1,product:{$arrayElemAt:['$product',0]}}
                }
                
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = 0;
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count= cart.products.length

            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        details.count = parseInt(details.count)
        return new Promise((resolve,reject)=>{
            if(details.count==-1&&details.quantity==1){
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({_id:objectId(details.cart)},
                    {
                        $pull:{products:{item:objectId(details.product)}}
                    }).then((response)=>{
                        resolve({removeProduct:true})
                    })
            }else{
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                    {
                        $inc:{'products.$.quantity':details.count}
                    }).then((response)=>{  
                            resolve({status:true})
                        })
                }
        
                
            })
    },
    getTotalAmount:(userId)=>{
        console.log(userId,"userid+152")
        return new Promise(async(resolve,reject)=>{
            let Total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{item:1,quantity:1,product:{$arrayElemAt:['$product',0]}}
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.Price']}}
                    }
                }
                
            ]).toArray()
            console.log(Total.length)
            if(Total.length){
                resolve(Total[0].total) //totalprice
            }else{
                resolve()
            }
            
            
        })

    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total)
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collections.CART_COLLECTION).removeOne({user:objectId(order.userId)})
                resolve(response.ops[0]._id)
            })
        })
        
    },
    getCartProductsList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            let cart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
            
                resolve(cart.products)
            
            
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId)
            let orders=await db.get().collection(collections.ORDER_COLLECTION)
                .find({userId:objectId(userId)}).toArray()
            
            console.log(orders)
            resolve(orders)
        })
    },
    getOrderProducts:(orderId)=>{
        console.log(orderId)
        return new Promise(async(resolve,reject)=>{
            let orderItems = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },{
                    $unwind:'$products'
                },{
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },{
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },{
                    $project:{item:1,quantity:1,product:{$arrayElemAt:['$product',0]}}
                }
                
            ]).toArray()
            console.log(orderItems,"order items")
            resolve(orderItems)
        })

    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: total,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                console.log(order);
                resolve(order)
              });
        })
    },
    verifyPayment:(details)=>{
        return new Promise
    }

    
            

}
