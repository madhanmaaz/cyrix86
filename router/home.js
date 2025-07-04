const express = require('express')
const path = require("node:path")
const fs = require("node:fs")

const clientManager = require('../utils/clientManager')
const helpers = require('../utils/helpers')
const router = express.Router()

router.get("/", (req, res) => {
    const clients = []

    fs.readdirSync(helpers.clientsFolderPath, {
        withFileTypes: true
    }).forEach(file => {
        const infoFile = path.join(helpers.clientsFolderPath, file.name, "info.json")

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

        const clientPath = path.join(helpers.clientsFolderPath, id)
        if (!fs.existsSync(clientPath)) {
            return res.json({
                ack: false,
                msg: "Client not found"
            })
        }

        // disconnect python client
        const client = clientManager.PYTHON_CLIENTS[id]
        if (client) {
            return res.json({
                ack: false,
                msg: "Client is connected. Please disconnect it first."
            })
        }

        fs.rmSync(clientPath, { recursive: true })

        res.json({
            ack: true
        })
    } catch (error) {
        console.error(error)
        res.json({
            ack: false,
            msg: error.message
        })
    }
})

module.exports = router