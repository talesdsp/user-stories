const morgan = require("morgan")
const connectDB = require("./config/db")
const exphbs = require("express-handlebars")
const express = require("express")
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

// DATABASE
connectDB()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// HandleBars Helpers
const { formatDate, stripTags, truncate } = require("./helpers/hsb")

// HandleBars
app.engine(
  ".hbs",
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
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
