const Address = require('../models/Address')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors')

const addAddress = async (req, res) => {
    const address = await Address.create(req.body)
    res.status(StatusCodes.CREATED).json({ address })
}

const getAllAddresses = async (req,res) => {
    const addresses = await Address.find({});
    res.status(StatusCodes.OK).json({addresses, count: addresses.length})
}

module.exports = {
    addAddress,
    getAllAddresses
}