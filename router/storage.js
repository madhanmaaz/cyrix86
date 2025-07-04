const express = require('express')
const router = express.Router()
const fs = require("node:fs")
const path = require("node:path")
const helpers = require('../utils/helpers')

router.get("/", (req, res) => {
    const { id } = req.query
    if (!id) {
        return res.redirect("/")
    }

    const clientPath = path.join(helpers.clientsFolderPath, id)
    if (!fs.existsSync(clientPath)) {
        return res.redirect("/")
    }

    const files = fs.readdirSync(clientPath).map(file => {
        const stats = fs.statSync(path.join(clientPath, file))
        if (stats.isDirectory()) return

        return {
            name: file,
            size: (stats.size / 1024).toFixed(2) + " KB",
            extension: path.extname(file),
            lastModified: new Date(stats.mtime).toLocaleString()
        }
    }).filter(Boolean)

    res.render("storage", {
        id,
        files
    })
})

router.delete("/", async (req, res) => {
    try {
        const { id, filename } = req.body
        const filePath = path.join(helpers.clientsFolderPath, id, filename)

        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true })
        }

        res.json({
            ack: true,
            msg: "File deleted successfully"
        })
    } catch (error) {
        res.json({
            ack: false,
            msg: error.message
        })
    }
})

router.get("/download/:id/:filename", async (req, res) => {
    const { id, filename } = req.params
    if (!id || !filename) {
        return res.sendStatus(400)
    }

    const filePath = path.resolve(helpers.clientsFolderPath, id, filename)
    if (!fs.existsSync(filePath)) {
        return res.sendStatus(404)
    }

    res.sendFile(filePath, { dotfiles: "allow" }, (err) => {
        if (err) {
            return res.sendStatus(500)
        }
    })
})

module.exports = router