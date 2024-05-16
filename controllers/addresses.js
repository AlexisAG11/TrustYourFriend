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

const deleteAddress = async (req,res) => {
    const {params:{name:addressName}} = req
    const address = await Address.findOneAndDelete({name: addressName})
    if (!address) {
        throw new NotFoundError(`No address with name ${addressName}`)
    }
    res.status(StatusCodes.OK).send()
}

module.exports = {
    addAddress,
    getAllAddresses,
    deleteAddress
}