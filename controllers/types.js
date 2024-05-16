const Type = require('../models/Type')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors')

const addType = async (req, res) => {
    const type = await Type.create(req.body)
    res.status(StatusCodes.CREATED).json({ type })
}

const getAllTypes = async (req,res) => {
    const types = await Type.find({});
    res.status(StatusCodes.OK).json({types, count: types.length})
}

const deleteType = async (req,res) => {
    const {params:{name:typeName}} = req
    const type = await Type.findOneAndDelete({name: typeName})
    if (!type) {
        throw new NotFoundError(`No address with name ${typeName}`)
    }
    res.status(StatusCodes.OK).send()
}

module.exports = {
    addType,
    getAllTypes,
    deleteType
}