const express = require('express')
const router = express.Router()

const {acceptRequest, deleteFriend, getAllFriend, friendRequest, declineRequest} = require('../controllers/friends')

router.route('/').get(getAllFriend);
router.route('/acceptRequest').patch(acceptRequest);
router.route('/delete').patch(deleteFriend);
router.route('/request').patch(friendRequest);
router.route('/declineRequest').patch(declineRequest);

module.exports = router
