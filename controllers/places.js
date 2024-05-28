const { NotFoundError, BadRequestError } = require('../errors')
const Place = require('../models/Place')
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const mongoose = require('mongoose');
require('dotenv').config()

// AWS Bucket
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const awsBucketName = process.env.AWS_BUCKET_NAME
const awsBucketRegion = process.env.AWS_BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: awsBucketRegion
})

// crypto
const crypto = require('crypto')
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
const defaultPhoto = ["japonais-defaut.avif","italien-defaut.avif","français-defaut.avif","chinoise-defaut.avif","mexicain-defaut.avif","libanais-defaut.avif","bar-defaut.avif","brunch-defaut.avif","americain-defaut.avif","image-preview-icon-picture-placeholder-vector-31284806.jpg"];

const createPlace = async (req, res) => {
    // fetch it from the authMiddlware
    req.body.createdById = req.user.userId
    req.body.createdByName = req.user.name
    if (req.file) {
        const imageName = randomImageName();
        req.body.image = imageName;

        const params = {
            Bucket: awsBucketName,
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }
        const command = new PutObjectCommand(params);
        await s3.send(command)
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

    // retrieve the image from S3 bucket and made it accessible with a temprary link
    const modifiedPlaces = [];
    for (const place of places) {
        if (defaultPhoto.includes(place.image)) {
            const placeObj = place.toObject();
            placeObj.imageUrl = process.env.BACK_URL +'/uploads/'+ place.image;
            modifiedPlaces.push(placeObj);
        }
        else {
            const getObjectParams = {
                Bucket: awsBucketName,
                Key: place.image
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 60 });
            const placeObj = place.toObject();
            placeObj.imageUrl = url;
            modifiedPlaces.push(placeObj);
        }
    }
    res.status(StatusCodes.OK).json({modifiedPlaces, count: places.length, user: req.user.userId})
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

    if (req.file) {
        const imageName = randomImageName();
        req.body.image = imageName;

        const params = {
            Bucket: awsBucketName,
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }
        const command = new PutObjectCommand(params);
        await s3.send(command)
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
    if (!defaultPhoto.includes(place.image)) {
        const params = {
            Bucket: awsBucketName,
            Key: place.image
        }
        const command = new DeleteObjectCommand(params)
        await s3.send(command);
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