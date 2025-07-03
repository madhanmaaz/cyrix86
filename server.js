process.__dirname = __dirname

const expressFileUpload = require("express-fileupload")
const cookieParser = require("cookie-parser")
const socketIo = require("socket.io")
const tarkine = require("tarkine")
const express = require('express')
const http = require('http')
const path = require('path')
const fs = require('fs')

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

// middleware
app.use(function (req, res, next) {
    tarkine.store.set("url", req.url)

    const folders = []
    const clientPath = path.join(process.__dirname, "public", "uploads")
    if (fs.existsSync(clientPath)) {
        fs.readdirSync(clientPath, { withFileTypes: true }).forEach(file => {
            if (file.isDirectory()) {
                folders.push(file.name)
            }
        })
    }

    tarkine.store.set("clientsFolders", folders)
    tarkine.store.set("clientFolderId", req.query.id || "global")
    next()
})

// check token
app.use("/", require("./router/index"))
app.use("/p", require("./router/payload"))
app.use("/client", require("./router/client"))
app.use("/home", helpers.authorization, require("./router/home"))
app.use("/panel", helpers.authorization, require("./router/panel"))
app.use("/create", helpers.authorization, require("./router/create"))
app.use("/storage", helpers.authorization, require("./router/storage"))

server.listen(config.port || process.env.PORT, () => {
    console.log(`Listening on port http://localhost:${config.port}`)
})