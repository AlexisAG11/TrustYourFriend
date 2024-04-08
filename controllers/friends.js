const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors')

const addFriend = async (req, res) => {
    const {
        body: {friendId},
        user:{userId}
    } = req

    if (!friendId ||friendId === '') {
        throw new BadRequestError('friendId cannot be empty')
    }
    const friendUser = await User.findById(friendId)
    if (!friendUser) {
        throw new NotFoundError(`No User with this id : ${friendId}`)
    }
    const user = await User.findByIdAndUpdate({_id:userId},
        { $addToSet: {friends: friendId}},
        {new: true, runValidators: true}
    )
    if (!user) {
        throw new NotFoundError(`No place with this id : ${placeId}`)
    }
    res.status(StatusCodes.OK).json(user)
}

const deleteFriend = async (req, res) => {
    const {
        body: {friendId},
        user:{userId}
    } = req

    if (!friendId ||friendId === '') {
        throw new BadRequestError('friendId cannot be empty')
    }
    const friendUser = await User.findById(friendId)
    if (!friendUser) {
        throw new NotFoundError(`No User with this id : ${friendId}`)
    }
    const user = await User.findByIdAndUpdate({_id:userId},
        { $pull: {friends: friendId}},
        {new: true, runValidators: true}
    )
    if (!user) {
        throw new NotFoundError(`No place with this id : ${placeId}`)
    }
    res.status(StatusCodes.OK).json(user)
}

module.exports = {
    addFriend,
    deleteFriend

}