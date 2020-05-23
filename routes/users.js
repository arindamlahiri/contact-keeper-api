const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const router = express.Router()
const { check, validationResult } = require('express-validator')

//@route    POST api/users
//@desc     Register a user
//@access   Public
router.post('/', [
    check('name','Please add name').not().isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with atleast 6 characters').isLength({ min:6 })
], async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})
    }

    let db = req.app.locals.db
    try {
        let user = await db.db('contact-keeper').collection('users').findOne({email:req.body.email})
        if(user) return res.status(400).json({ msg: "Email already registered" })

        const { name, email, password } = req.body
        user = {
            name,
            email,
            password
        }
        let salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password,salt)

        let result = await db.db('contact-keeper').collection('users').insertOne(user)

        const payload = {
            user:{
                id:result.insertedId
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