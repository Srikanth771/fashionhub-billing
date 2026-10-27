const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getCategories,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/meta/categories', protect, getCategories);
router.get('/barcode/:barcode', protect, getProductByBarcode);

router
  .route('/')
  .get(protect, getProducts)
  .post(protect, createProduct);

router
  .route('/:id')
  .get(protect, getProductById)
  .put(protect, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

router.patch('/:id/stock', protect, adjustStock);

module.exports = router;
