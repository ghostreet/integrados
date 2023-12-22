export default class ProductDTO {
    constructor(product) {
        this.img = product.image
        this.name= product.name
        this.description = product.description       
        this.price = product.price
        this.stock = product.stock
        this.category = product.category
        this.availability = product.availability
       
    }
}