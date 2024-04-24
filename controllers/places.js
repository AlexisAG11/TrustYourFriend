const { NotFoundError, BadRequestError } = require('../errors')
const Place = require('../models/Place')
const {StatusCodes} = require('http-status-codes')

const createPlace = async (req, res) => {
    // fetch it from the authMiddlware
    req.body.createdById = req.user.userId
    req.body.createdByName = req.user.name
    if (req.file) {
        req.body.image = req.file.filename
    }
    const place = await Place.create(req.body)
    res.status(StatusCodes.CREATED).json({ place })
}

const getAllPlaces = async (req, res) => {
    const places = await Place.find().sort('-createdAt')
    res.status(StatusCodes.OK).json({places, count: places.length, user: req.user.userId})
}

const getPlace = async (req, res) => {
    const {user:{userId}, params:{id:placeId}} = req
    const place = await Place.findOne({
        _id:placeId, 
        createdBy:userId
    })
    if (!place) {
        throw new NotFoundError(`No place with id ${placeId}`)
    }
    res.status(StatusCodes.OK).json({place})
}

const updatePlace = async (req, res) => {
    const {
        body: {name, address},
        user:{userId},
        params:{id:placeId}
    } = req
    
    if (name === '' || address === '' ) {
        throw new BadRequestError('name or address field cannot be empty')
    }

    const place = await Place.findByIdAndUpdate({_id:placeId, createdBy:userId},
        req.body,
        {new: true, runValidators: true}
        )

    if (!place) {
        throw new NotFoundError(`No place with this id : ${placeId}`)
    }
    res.status(StatusCodes.OK).json({place})
}

const deletePlace = async (req,res) => {
    const {user:{userId}, params:{id:placeId}} = req
    const place = await Place.findByIdAndDelete({
        _id:placeId, 
        createdBy:userId
    })
    if (!place) {
        throw new NotFoundError(`No place with id ${placeId}`)
    }
    res.status(StatusCodes.OK).send()
}

module.exports = {
    createPlace,
    getAllPlaces,
    getPlace,
    updatePlace,
    deletePlace
}