const express = require('express')
const app = express()
const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient

require('dotenv').config()

app.use(express.urlencoded({ extended:false }))
app.use(express.json({ extended:false }))

app.get('/',(req,res) => {
    res.json({msg:"hello from server"})
})

app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/contacts', require('./routes/contacts'))

var PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`)

    mongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, (err,db) => {
        if(err) throw err
        
        app.locals.db = db
        app.locals.dbo = db.db('contact-keeper')
        console.log(`And db connected`)
    } )
})
