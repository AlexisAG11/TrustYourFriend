const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors')

const addFriend = async (req, res) => {
    const {
        body: {friendEmail},
        user:{userId}
    } = req

    if (!friendEmail ||friendEmail === '') {
        throw new BadRequestError('friendEmail cannot be empty')
    }
    const friendUser = await User.findOne({'email': friendEmail});
    
    if (!friendUser) {
        throw new NotFoundError(`Pas d'utilisateur avec cet email : ${friendEmail}`)
    }
    const friendId = friendUser._id.toString();
    const user = await User.findByIdAndUpdate({_id:userId},
        { $addToSet: {friends: {_id: friendId, name: friendUser.name} }},
        {new: true, runValidators: true}
    )
    res.status(StatusCodes.OK).json(user)
}

const deleteFriend = async (req, res) => {
    const {
        body: {friendId},
        user:{userId}
    } = req

    if (!friendId ||friendId === '') {
        throw new BadRequestError('cannot be empty')
    }
    const user = await User.findByIdAndUpdate({_id:userId},
        { $pull: {friends: {_id: friendId}}},
        {new: true, runValidators: true}
    )
    if (!user) {
        throw new NotFoundError(`No user with this id : ${placeId}`)
    }
    res.status(StatusCodes.OK).json(user)
}

const getAllFriend = async (req,res) => {
    const user = await User.findById(req.user.userId)
    res.status(StatusCodes.OK).json({friends: user.friends, count: user.friends.length, userId: req.user.userId, userName: req.user.name})

}

const getUserName = async (req, res) => {
    req
}

module.exports = {
    addFriend,
    deleteFriend,
    getAllFriend
}