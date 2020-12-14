const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const objectId = require('mongodb').ObjectID

const auth = require('../middleware/auth.js')

const router = express.Router()
const { check, validationResult } = require('express-validator')

//@route    Get api/auth
//@desc     Get logged in user
//@access   Private
router.get('/', auth, async(req,res) => {
    let db = req.app.locals.db
    try {
        const user = await db.db('contact-keeper').collection('users').findOne({_id:new objectId(req.user.id)},{projection:{password:0}})

        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ msg:"Server error" })
    }
})

//@route    Post api/auth
//@desc     Auth user & get token
//@access   Public
router.post('/',[
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with atleast 6 characters').isLength({ min:6 })
], async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})
    }

    let db = req.app.locals.db
    const { email, password } = req.body
    console.log(req.hostname)

    try {
        let user = await db.db('contact-keeper').collection('users').findOne({email})
        if(!user) return res.status(400).json({ msg: "Invalid credentials" })

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(400).json({ msg: "Invalid credentials" })

        const payload = {
            user:{
                id:user._id
            }
        }
        jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:3600
        },(err, token)=> {
            if(err) throw err

            res.json({token})
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

module.exports = router
