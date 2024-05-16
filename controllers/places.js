const { NotFoundError, BadRequestError } = require('../errors')
const Place = require('../models/Place')
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const mongoose = require('mongoose');

const createPlace = async (req, res) => {
    // fetch it from the authMiddlware
    req.body.createdById = req.user.userId
    req.body.createdByName = req.user.name
    console.log(req.file)
    console.log(req.body)
    if (req.file) {
        req.body.image = req.file.filename
    }
    else {
        // default food photo
        switch (req.body.type) {
            case 'Japonais':
                req.body.image = "japonais-defaut.avif";
                break;
            case 'Italien':
                req.body.image = "italien-defaut.avif";
                break;
            case 'Français':
                req.body.image = "français-defaut.avif";
                break;
            case 'Chinoise':
                req.body.image = "chinoise-defaut.avif";
                break;
            case 'Mexicain':
                req.body.image = "mexicain-defaut.avif";
                break;
            case 'Libanais':
                req.body.image = "libanais-defaut.avif";
                break;
            case 'Bar':
                req.body.image = "bar-defaut.avif";
                break;
            case 'Brunch':
                req.body.image = "brunch-defaut.avif";
                break;
            case 'Americain':
                req.body.image = "americain-defaut.avif";
                break;

          }
    }
    const place = await Place.create(req.body)
    res.status(StatusCodes.CREATED).json({ place })
}

const getAllPlaces = async (req, res) => {
    const userActive = await User.findById(req.user.userId);
    const userIds = userActive.friends
    // friend list for filtering
    let userIdsMaj = userIds.map(user => user._id); // Extracting just the ObjectIds
    userIdsMaj.push(userActive._id); // add the active user to the array
    
    // type list for filtering
    const typeIds = req.types;
    let typeIdsMaj = typeIds.map(ele => ele.name);
    // address list for filtering
    const addressIds = req.addresses;
    let addressIdsMaj = addressIds.map(ele => ele.name);

    let filterName = [];
    let filterType = [];
    let filterAddress = [];
    filterCreatedByValue = userIdsMaj;
    filterTypeName = typeIdsMaj;
    filterAddressName = addressIdsMaj;
    // case of a filter
    if (Object.keys(req.query).length !== 0) {
        if (req.query.nameID) {
            if (!Array.isArray(req.query.nameID)) {
                filterName.push(req.query.nameID)
            } else {
                filterName = req.query.nameID;
            }
            const filterNameMaj = filterName.map(value => { return new mongoose.Types.ObjectId(value)});
            filterCreatedByValue = filterNameMaj;
        }
        if(req.query.typeID){
            if (!Array.isArray(req.query.typeID)) {
                filterType.push(req.query.typeID)
            } else {
                filterType = req.query.typeID;
            }
            filterTypeName = filterType;
        }
        if(req.query.addressID){
            if (!Array.isArray(req.query.addressID)) {
                filterAddress.push(req.query.addressID)
            } else {
                filterAddress = req.query.addressID;
            }
            filterAddressName = filterAddress;
        }
    }
    const places = await Place.find({ 
        createdById: { $in: filterCreatedByValue },
        type: { $in: filterTypeName},
        address: {$in: filterAddressName}
    }).sort('-createdAt')
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