const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit');


// Create a rate limiter for the /googleAddress route
const googleAddressLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Allow only 5 requests per window
    message: 'Too many requests from this IP, please try again later.',
  });

const {addAddress} = require('../controllers/addresses')
const {getAllAddresses} = require('../controllers/addresses')
const {deleteAddress} = require('../controllers/addresses')
const {googleAddresses} = require('../controllers/addresses')

router.route('/').get(getAllAddresses);
router.route('/add').post(addAddress);
router.route('/:name').delete(deleteAddress);
router.route('/googleAddress').post(googleAddressLimiter, googleAddresses);
// router.route('/googleAddress').post(googleAddresses);

module.exports = router