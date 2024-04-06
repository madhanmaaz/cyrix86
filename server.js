process.__dirname = __dirname

const { serverInit } = require("./utils/server-helpers")
const expressFileUpload = require("express-fileupload")
const cookieParser = require("cookie-parser")
const config = require("./utils/config")
const socketIo = require("socket.io")
const express = require("express")
const http = require("http")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new socketIo.Server(server)

serverInit()
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: false }))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(expressFileUpload())
app.use(cookieParser())
app.use(express.json())
global.IO = io

// non checking
app.use("/tar", require("./router/tar"))

// checking
app.use("/", require("./router"))
app.use("/fm", require("./router/fm"))
app.use("/panel", require("./router/panel"))
app.use("/create", require("./router/create"))


const PORT = process.env.PORT || config.port
server.listen(PORT, () => {
    console.log(`RUNNING ON: http://localhost:${PORT}`)
})