const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookiesparser = require('cookie-parser')
const { app, server } = require('./socket/index')

const allowedOrigins = ['http://localhost:5200', 'http://localhost:3000'];

//const app = express()
app.use (cors({
    origin : allowedOrigins,
    credentials : true
}))
app.use(express.json())
app.use(cookiesparser())
const PORT = process.env.PORT || 5010

app.get('/',(request,response)=>{
    response.json({
        message : "Server is running at " + PORT
    })
})

app.use('/api/',router)

connectDB().then(()=>{
    server.listen(PORT,()=>{
        console.log("Server is running at " + PORT)
    })
})
