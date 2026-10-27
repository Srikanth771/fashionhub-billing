const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBillById,
  updateBillStatus,
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, createBill)
  .get(protect, getBills);

router.get('/:identifier', protect, getBillById);
router.patch('/:id/status', protect, updateBillStatus);

module.exports = router;
