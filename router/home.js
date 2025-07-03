const express = require('express')
const path = require("node:path")
const fs = require("node:fs")

const helpers = require('../utils/helpers')
const router = express.Router()

router.get("/", (req, res) => {
    const clients = []
    const clientPath = path.join(process.__dirname, "public", "uploads")

    if (!fs.existsSync(clientPath)) {
        fs.mkdirSync(clientPath)
    }

    fs.readdirSync(clientPath, {
        withFileTypes: true
    }).forEach(file => {
        const infoFile = path.join(clientPath, file.name, "info.json")

        if (file.isDirectory() && fs.existsSync(infoFile)) {
            const info = helpers.readJson(infoFile)
            clients.push(info)
        }
    })

    res.render("home", {
        clients,
    })
})

router.delete("/", async (req, res) => {
    try {
        const { id } = req.body

        if (!id) {
            return res.json({
                ack: false,
                msg: "No ID found"
            })
        }

        const clientPath = path.join(process.__dirname, "public", "uploads", id)
        if (!fs.existsSync(clientPath)) {
            return res.json({
                ack: false,
                msg: "Client not found"
            })
        }

        // disconnect python client
        const client = helpers.PYTHON_CLIENTS[id]
        if (client && client.connected) {
            client.disconnect(true)
        }

        fs.rmSync(clientPath, { recursive: true })

        res.json({
            ack: true
        })
    } catch (error) {
        res.json({
            ack: false,
            msg: error.message
        })
    }
})

module.exports = router