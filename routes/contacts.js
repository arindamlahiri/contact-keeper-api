const express = require('express')
const auth = require('../middleware/auth.js')
const objectId = require('mongodb').ObjectID

const router = express.Router()
const { check, validationResult } = require('express-validator')

//@route    GET api/contacts
//@desc     Get all users contacts
//@access   Private
router.get('/',auth, async(req,res) => {
    let dbo = req.app.locals.dbo
    try {
        const contacts = await dbo.collection('contacts').find({user:req.user.id}).toArray()

        res.json(contacts.reverse())
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ msg: "Server error" })
    }
})

//@route    POST api/contacts
//@desc     Add new contact
//@access   Private
router.post('/', [ auth, [
    check('name','Please include a name').not().isEmpty()
]], async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})
    }
    const { name,email,phone,type } = req.body
    let dbo = req.app.locals.dbo

    try {
        let newContact = {
            name,email,phone,type,user:req.user.id
        }
        let result = await dbo.collection('contacts').insertOne(newContact)
        res.json(result.ops[0])
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ msg:'Server error'})
    }
})

//@route    PUT api/contacts/:id
//@desc     Update contact
//@access   Private
router.put('/:id', auth, async(req,res) => {
    const { name,email,phone,type } = req.body

    const update = {}
    if(name) update.name = name
    if(email) update.email = email
    if(phone) update.phone = phone
    if(type) update.type = type
    let dbo = req.app.locals.dbo

    try {

        let contact = await dbo.collection('contacts').findOne({_id:new objectId(req.params.id)})
        if(!contact) return res.status(404).json({ msg:'Contact not found' })

        if(contact.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorised'})
        
        let result = await dbo.collection('contacts').findOneAndUpdate({ _id: new objectId(req.params.id) },{ $set:update },{  returnOriginal: false })
        res.json(result.value)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ msg:'Server error'})
    }
})

//@route    DELETE api/contacts/:id
//@desc     Delete contact
//@access   Private
router.delete('/:id',auth, async(req,res) => {
    let dbo = req.app.locals.dbo

    try {

        let contact = await dbo.collection('contacts').findOne({_id:new objectId(req.params.id)})
        if(!contact) return res.status(404).json({ msg:'Contact not found' })

        if(contact.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorised'})
        
        await dbo.collection('contacts').deleteOne({ _id: new objectId(req.params.id) })
        res.json({ msg:"Contact deleted" })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ msg:'Server error'})
    }
})

module.exports = router