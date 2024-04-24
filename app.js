require('dotenv').config()
// allow to don't use async wrapper and try catch
// direct return in the error handler when there is one
require('express-async-errors')
const express = require('express')
const app = express()

// connectDB
const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

// allows cors
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
app.use(cors(corsOptions)) // Use this after the variable declaration

// routers
const authRouter = require('./routes/auth')
const placesRouter = require('./routes/places')
const friendsRouter = require('./routes/friends')

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.use(express.json())
app.use('/uploads', express.static('uploads'))
// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/places', authenticateUser, placesRouter)
app.use('/api/v1/friends', authenticateUser, friendsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is istening on port ${port}`))
    } catch (error) {
        console.log(error)   
    }
}

start()