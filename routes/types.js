const express = require('express')
const router = express.Router()

const {addType} = require('../controllers/types')
const {getAllTypes} = require('../controllers/types')
const {deleteType} = require('../controllers/types')

router.route('/').get(getAllTypes);
router.route('/add').post(addType);
router.route('/:name').delete(deleteType);

module.exports = router