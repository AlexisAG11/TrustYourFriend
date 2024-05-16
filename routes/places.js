const express = require('express')
const router = express.Router()
const uploadImage = require('../middleware/upload')
const getAllTypesMiddle = require('../middleware/types')
const getAllAddressesMiddle = require('../middleware/addresses')

const {
    createPlace,
    getAllPlaces,
    getPlace,
    updatePlace,
    deletePlace,
} = require('../controllers/places')

router.route('/').post(uploadImage,createPlace).get(getAllTypesMiddle,getAllAddressesMiddle,getAllPlaces)

router.route('/:id').get(getPlace).patch(uploadImage,updatePlace).delete(deletePlace)

module.exports = router