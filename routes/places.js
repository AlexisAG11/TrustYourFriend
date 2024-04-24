const express = require('express')
const router = express.Router()
const uploadImage = require('../middleware/upload')

const {
    createPlace,
    getAllPlaces,
    getPlace,
    updatePlace,
    deletePlace
} = require('../controllers/places')

router.route('/').post(uploadImage,createPlace).get(getAllPlaces)

router.route('/:id').get(getPlace).patch(updatePlace).delete(deletePlace)

module.exports = router