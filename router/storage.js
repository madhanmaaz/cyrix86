const express = require('express')
const router = express.Router()
const fs = require("node:fs")
const path = require("node:path")

const ROOT = path.join(process.__dirname, "public", "uploads")
if (!fs.existsSync(ROOT)) {
    fs.mkdirSync(ROOT)
}

router.get("/", (req, res) => {
    const { id } = req.query

    if (!id) return res.redirect("/")

    const globalFiles = fs.readdirSync(ROOT).map(file => {
        const stats = fs.statSync(path.join(ROOT, file))
        if (stats.isDirectory()) return

        return {
            name: file,
            size: (stats.size / 1024).toFixed(2) + " KB",
            extension: path.extname(file),
            lastModified: new Date(stats.mtime).toLocaleString()
        }
    }).filter(Boolean)

    let clientFiles = []
    if (id !== "global") {
        const clientPath = path.join(ROOT, id)
        if (!fs.existsSync(clientPath)) return res.redirect("/")

        clientFiles = fs.readdirSync(clientPath).map(file => {
            const stats = fs.statSync(path.join(clientPath, file))
            if (stats.isDirectory()) return

            return {
                name: file,
                size: (stats.size / 1024).toFixed(2) + " KB",
                extension: path.extname(file),
                lastModified: new Date(stats.mtime).toLocaleString()
            }
        }).filter(Boolean)
    }

    res.render("storage", {
        id,
        globalFiles,
        clientFiles
    })
})

router.post("/", async (req, res) => {
    try {
        const files = req.files
        if (!files) {
            return res.json({
                ack: false,
                msg: "No files found"
            })
        }

        const uploadFile = files.file
        const filePath = path.join(ROOT, uploadFile.name)

        uploadFile.mv(filePath, (err) => {
            if (err) {
                return res.json({
                    ack: false,
                    msg: err.message
                })
            }

            res.json({
                ack: true
            })
        })
    } catch (error) {
        res.json({
            ack: false,
            msg: error.message
        })
    }
})

router.delete("/", async (req, res) => {
    try {
        const { id, filename } = req.body
        let filePath = path.join(ROOT, id, filename)

        if (id === "global") {
            filePath = path.join(ROOT, filename)
        }

        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true })
        }

        res.json({ ack: true })
    } catch (error) {
        res.json({
            ack: false,
            msg: error.message
        })
    }
})

module.exports = router