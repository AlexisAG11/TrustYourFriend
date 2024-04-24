const mongoose = require('mongoose')

const PlaceSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Please provide a name'],
        maxlength:50
    },
    address: {
        type: String,
        require: [true, 'Please provide the address'],
        maxlength: 50
    },
    type: {
        type: String,
        require: [true, 'Please provide the type'],
        maxlength: 50
    },
    createdById: {
        type:mongoose.Types.ObjectId,
        ref:'User',
        required: [true, 'Please provide user']
    },
    createdByName: {
        type: String,
        maxlength: 50
    },
    image: {
        type: String,
        maxlength: 70,
        default: "image-preview-icon-picture-placeholder-vector-31284806.jpg"
    },
    comment: {
        type: String,
        maxlength: 300,
        default: ""
    },
}, {timestamps: true})

module.exports = mongoose.model('Place', PlaceSchema)