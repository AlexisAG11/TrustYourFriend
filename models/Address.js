const mongoose = require('mongoose')

const AddressSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Please provide a name'],
        maxlength:50
    },
    checkboxFilled: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Address', AddressSchema)