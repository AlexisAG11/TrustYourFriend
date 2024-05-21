const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors')

const acceptRequest = async (req, res) => {
    const {
        body: {requestedFriendId},
        user:{userId, name}
    } = req
    if (!requestedFriendId ||requestedFriendId === '') {
        throw new BadRequestError("l'id n'a pas été renseigné");
    }
    
    const newFriend = await User.findById(requestedFriendId);
    const userActive = await User.findById(userId);

    // case where he didn't request to be friend
    if (!newFriend.sentFriendRequests.some(friend => friend._id.toString() === userId) || !userActive.receivedFriendRequests.some(friend => friend._id.toString() === newFriend._id.toString())) {
        throw new BadRequestError("Il faut d'abord faire une demande d'amis");
    }
    
    // delete value in the array used for pending request
    newFriend.sentFriendRequests = newFriend.sentFriendRequests.filter(value => value._id.toString() !== userId);
    userActive.receivedFriendRequests = userActive.receivedFriendRequests.filter(value => value._id.toString() !== requestedFriendId);
    // add friends
    newFriend.friends.push({_id: userId, name: name});
    userActive.friends.push({_id: requestedFriendId, name: newFriend.name.toString()});

    await newFriend.save();
    await userActive.save();

    res.status(StatusCodes.OK).json({userActive, newFriend})

}
const declineRequest = async (req, res) => {
    const {
        body: {requestedFriendId},
        user:{userId, name}
    } = req
    if (!requestedFriendId ||requestedFriendId === '') {
        throw new BadRequestError("l'id n'a pas été renseigné");
    }
    
    const newFriend = await User.findById(requestedFriendId);
    const userActive = await User.findById(userId);

    // case where he didn't request to be friend
    if (!newFriend.sentFriendRequests.some(friend => friend._id.toString() === userId) || !userActive.receivedFriendRequests.some(friend => friend._id.toString() === newFriend._id.toString())) {
        throw new BadRequestError("cette personne ne vous a pas fait de demande d'ami");
    }
    
    // delete value in the array used for pending request
    newFriend.sentFriendRequests = newFriend.sentFriendRequests.filter(value => value._id.toString() !== userId);
    userActive.receivedFriendRequests = userActive.receivedFriendRequests.filter(value => value._id.toString() !== requestedFriendId);

    await newFriend.save();
    await userActive.save();

    res.status(StatusCodes.OK).json({userActive, newFriend})

}

const deleteFriend = async (req, res) => {
    const {
        body: {friendId},
        user:{userId}
    } = req

    if (!friendId ||friendId === '') {
        throw new BadRequestError('cannot be empty')
    }
    const userActive = await User.findByIdAndUpdate({_id:userId},
        { $pull: {friends: {_id: friendId}}},
        {new: true, runValidators: true}
    )
    if (!userActive) {
        throw new NotFoundError(`No user with this id : ${friendId}`)
    }
    const deleteFriend = await User.findByIdAndUpdate({_id:friendId},
        { $pull: {friends: {_id: userId}}},
        {new: true, runValidators: true}
    )
    res.status(StatusCodes.OK).json({userActive, deleteFriend})
}

const getAllFriend = async (req,res) => {
    const user = await User.findById(req.user.userId);
    res.status(StatusCodes.OK).json({friends: user.friends, sentFriendRequests: user.sentFriendRequests, receivedFriendRequests: user.receivedFriendRequests, count: user.friends.length, userId: req.user.userId, userName: req.user.name})

}

const friendRequest = async (req, res) => {
    const {
        body: {friendEmail},
        user:{userId}
    } = req

    if (!friendEmail ||friendEmail === '') {
        throw new BadRequestError('friendEmail cannot be empty');
    }

    const friendUser = await User.findOne({'email': friendEmail});
    
    // specifics cases
    if (!friendUser) {
        throw new NotFoundError(`Pas d'utilisateur avec cet email : ${friendEmail}`);
    }
    if (friendUser._id.toString() === userId) {
        throw new NotFoundError(`Impossible de s'ajouter soi même en ami`);
    }
    if (friendUser.friends.some(friend => friend._id.toString() === userId)) {
        throw new NotFoundError(`${friendUser.name} est déja dans la liste d'amis`);
    }
    if (friendUser.receivedFriendRequests.some(friend => friend._id.toString() === userId)) {
        throw new NotFoundError(`Demande d'ami déjà faite en attente d'une réponse`);
    }
    if (friendUser.sentFriendRequests.some(friend => friend._id.toString() === userId)) {
        throw new NotFoundError(`La demande d'amis a déjà été faite par ${friendUser.name}`);
    }

    const user = await User.findByIdAndUpdate({_id:userId},
        { $addToSet: {sentFriendRequests: {_id: friendUser._id, name: friendUser.name} }},
        {new: true, runValidators: true}
    )
    const userFriend = await User.findByIdAndUpdate({_id:friendUser._id},
        { $addToSet: {receivedFriendRequests: {_id: userId, name: user.name} }},
        {new: true, runValidators: true}
    )
    res.status(StatusCodes.OK).json({user,userFriend})
}

module.exports = {
    acceptRequest,
    deleteFriend,
    getAllFriend,
    friendRequest,
    declineRequest
}