const morgan = require("morgan")
const connectDB = require("./config/db")
const exphbs = require("express-handlebars")
const express = require("express")
const methodOverride = require("method-override")
const app = express()
const path = require("path")
const passport = require("passport")
const session = require("express-session")
const mongoose = require("mongoose")
const MongoStore = require("connect-mongo")(session)

// Load ENV VARS
require("dotenv").config({ path: "./config/config.env" })

// Passport config
require("./config/passport")(passport)

// Sessions
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
  })
)

// Middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

// DATABASE
connectDB()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method Override
app.use(
  methodOverride(
    (req,
    (res) => {
      if (req.body && typeof req.body === "object" && "_method" in req.body) {
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )
)

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// HandleBars Helpers
const { editIcon, formatDate, stripTags, truncate, select } = require("./helpers/hsb")

// HandleBars
app.engine(
  ".hbs",
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: "main",
    extname: ".hbs",
  })
)
app.set("view engine", ".hbs")

// Static folder
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/", require("./routes/index"))
app.use("/auth", require("./routes/auth"))
app.use("/stories", require("./routes/stories"))

app.listen(process.env.PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`)
)
