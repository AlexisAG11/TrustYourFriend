const express = require('express')
const router = express.Router()

const {addFriend, deleteFriend} = require('../controllers/friends')

router.route('/add').patch(addFriend);
router.route('/delete').patch(deleteFriend);

module.exports = router
