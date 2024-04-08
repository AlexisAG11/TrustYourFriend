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
    createdBy: {
        type:mongoose.Types.ObjectId,
        ref:'User',
        required: [true, 'Please provide user']
    }
}, {timestamps: true})

module.exports = mongoose.model('Place', PlaceSchema)