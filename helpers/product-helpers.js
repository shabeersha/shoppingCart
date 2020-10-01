const collections = require('../config/collections')

db=require('../config/connection')


module.exports={
    addProduct:(product,callback)=>{
        db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })


    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
}