
import ProductsManager from '../dao/servicios/ProductManager.js';

const productManager = new ProductsManager();

productManager.addProducts();

productManager.deleteProduct('/products/:id', async (req, res) => {
    try {
        const result = await productManager.deleteProduct(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

productManager.updateProduct();
productManager.getProducts();
productManager.exist();
productManager.getProdId();
productManager.getProdLimit();
productManager.getProdPage();
productManager.getProdQuery(); 
productManager.getProdSort();


export default productManager;