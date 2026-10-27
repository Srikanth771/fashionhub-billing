const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerHistory,
  deleteCustomer,
  sendOfferToCustomers,
  clearAllData,
} = require('../controllers/customerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getCustomers);
router.get('/:phone/history', protect, getCustomerHistory);
router.delete('/clear-all-data', protect, adminOnly, clearAllData);
router.post('/send-offer', protect, sendOfferToCustomers);
router.delete('/:id', protect, deleteCustomer);

module.exports = router;
