const { NotFoundError, BadRequestError } = require('../errors')
const Place = require('../models/Place')
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const mongoose = require('mongoose');

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
    const userActive = await User.findById(req.user.userId);
    const userIds = userActive.friends
    const userIdsMaj = userIds.map(user => user._id); // Extracting just the ObjectIds
    userIdsMaj.push(userActive._id);

    let filterCreatedByValue = [];
    // default case (no filter)
    if (Object.keys(req.query).length === 0) {
        filterCreatedByValue = userIdsMaj;
    }
    // case of a filter
    else {
        let filterName = [];
        if (!Array.isArray(req.query.nameID)) {
            filterName.push(req.query.nameID)
        } else {
            filterName = req.query.nameID;
        }
        const filterNameMaj = filterName.map(value => { return new mongoose.Types.ObjectId(value)});
        filterCreatedByValue = filterNameMaj;
    }
    const places = await Place.find({ createdById: { $in: filterCreatedByValue } }).sort('-createdAt')
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

const getAllPlacesFilterByName = async (req, res) => {
    const userActive = await User.findById(req.user.userId);
    const userIds = userActive.friends
    const userIdsMaj = userIds.map(user => user._id); // Extracting just the ObjectIds
    userIdsMaj.push(userActive._id);
    const places = await Place.find({ createdById: { $in: userIdsMaj } }).sort('-createdAt')
    res.status(StatusCodes.OK).json({places, count: places.length, user: req.user.userId})
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

    if (req.file) {
        req.body.image = req.file.filename
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
    deletePlace,
    getAllPlacesFilterByName
}