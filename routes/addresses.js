const express = require('express')
const router = express.Router()

const {addAddress} = require('../controllers/addresses')
const {getAllAddresses} = require('../controllers/addresses')
const {deleteAddress} = require('../controllers/addresses')

router.route('/').get(getAllAddresses);
router.route('/add').post(addAddress);
router.route('/:name').delete(deleteAddress);

module.exports = router