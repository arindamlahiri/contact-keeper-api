const express = require('express')
const app = express()
const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient
const path = require('path')

require('dotenv').config()

app.use(express.urlencoded({ extended:false }))
app.use(express.json({ extended:false }))

app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/contacts', require('./routes/contacts'))

//Serve static assets in production
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))

    app.get('*', (req,res) => {
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

var PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`)

    mongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, (err,db) => {
        if(err) throw err
        
        app.locals.db = db
        app.locals.dbo = db.db('contact-keeper')
        console.log(`And db connected`)
        console.log(req.hostname)
    } )
})
