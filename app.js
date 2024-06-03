require('dotenv').config()
// allow to don't use async wrapper and try catch
// direct return in the error handler when there is one
require('express-async-errors')
const express = require('express')
const app = express()

// connectDB
const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

// extra security packages
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
const cors = require('cors');

// routers
const authRouter = require('./routes/auth')
const placesRouter = require('./routes/places')
const friendsRouter = require('./routes/friends')
const addressesRouter = require('./routes/addresses')
const typesRouter = require('./routes/types')

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// security
 
app.use(rateLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
}))
app.use(express.json())
app.use(helmet())
app.use(cors({
    credentials: true,
    origin: 'https://trustyourfriend-front.onrender.com'
  }));
app.use(xss())

app.use('/uploads', express.static('uploads'))
// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/places', authenticateUser, placesRouter)
app.use('/api/v1/friends', authenticateUser, friendsRouter)
app.use('/api/v1/addresses', authenticateUser, addressesRouter)
app.use('/api/v1/types', authenticateUser, typesRouter)

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