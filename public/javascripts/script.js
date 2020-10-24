function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                 $('#cartCount').html(response.cartCount)
            }
        }
    
    })
}