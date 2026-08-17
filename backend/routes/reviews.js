const express = require('express');
const router = express.Router();
const { submitReview, getReviews, getPendingReviews } = require('../controllers/reviewsController');

router.get('/', getReviews);
router.get('/pending', getPendingReviews);
router.post('/', submitReview);

module.exports = router;
