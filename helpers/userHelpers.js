const collections = require('../config/collections')
db=require('../config/connection')
const bcrypt=require('bcrypt')

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
    }
}