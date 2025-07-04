process.__dirname = __dirname

const expressFileUpload = require("express-fileupload")
const cookieParser = require("cookie-parser")
const socketIo = require("socket.io")
const tarkine = require("tarkine")
const express = require('express')
const http = require('http')
const path = require('path')

const helpers = require('./utils/helpers')
const config = require('./config')

const app = express()
const server = http.createServer(app)
const io = new socketIo.Server(server)

app.use("/public", express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }))
app.use(expressFileUpload())
app.use(express.json())
app.use(cookieParser())
global.IO = io

// view engine
app.set("views", path.join(__dirname, "views"))
app.set("view engine", tarkine.ext)
app.engine(tarkine.ext, tarkine.renderFile)

// routes
app.use("/", require("./router/index"))
app.use("/p", require("./router/payload"))
app.use("/client", require("./router/client"))

app.use(helpers.authorization)
app.use("/home", require("./router/home"))
app.use("/panel", require("./router/panel"))
app.use("/create", require("./router/create"))
app.use("/storage", require("./router/storage"))

server.listen(config.port || process.env.PORT, () => {
    console.log(`Listening on port http://localhost:${config.port}`)
})