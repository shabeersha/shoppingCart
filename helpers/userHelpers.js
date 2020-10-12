const collections = require('../config/collections')
db=require('../config/connection')
const bcrypt=require('bcrypt')
const { ObjectID } = require('mongodb')
var objectId=require('mongodb').ObjectID

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
        
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})

            

            if(userCart){
                db.get().collection(collections.CART_COLLECTION)
                .updateOne({user:objectId(userId)},
                    {
                        $push:{
                            products:objectId(proId)
                        }

                    }
                ).then((response)=>{
                    resolve()
                })

            }else{
                let cartObj ={
                    user:objectId(userId),
                    products:[objectId(proId)]
                }

                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
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
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        let:{proList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id',"$$proList"]
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
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
    }
}