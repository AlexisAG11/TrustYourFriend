const express = require('express')
const router = express.Router()

const {addFriend, deleteFriend, getAllFriend} = require('../controllers/friends')

router.route('/').get(getAllFriend);
router.route('/add').patch(addFriend);
router.route('/delete').patch(deleteFriend);

module.exports = router
