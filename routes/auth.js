const express = require('express')

const router = express.Router()

//@route    Get api/auth
//@desc     Get logged in user
//@access   Private
router.get('/', (req,res) => {
    res.json({msg: "get logged in user"})
})

//@route    Post api/auth
//@desc     Auth user & get token
//@access   Public
router.post('/', (req,res) => {
    res.json({msg: 'Log in user'})
})

module.exports = router