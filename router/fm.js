const express = require("express")
const fs = require("fs")
const router = express.Router()
const path = require("path")

router.route("/").get((req, res) => {
    const { id } = req.query
    const globalFiles = fs.readdirSync(path.join(process.__dirname, "public", "global"))

    if (id == "global") {
        res.render("fm", {
            id,
            globalFiles,
            tarFiles: []
        })
        return
    }

    const folderPath = path.join(process.__dirname, "public", "uploads", id)
    if (fs.existsSync(folderPath)) {
        const tarFiles = fs.readdirSync(folderPath)

        res.render("fm", {
            id,
            globalFiles,
            tarFiles
        })
        return
    }

    res.send("target not found")
}).post((req, res) => {
    if (req.files) {
        const uploadFile = req.files.file

        uploadFile.mv(path.join(process.__dirname, "public", "global", uploadFile.name), (err) => {
            if (err) console.log(err)
        })
    }
    res.send("OK")
})

router.get("/del", (req, res) => {
    try {
        const { id, filename } = req.query
        let filePath = path.join(process.__dirname, "public", "uploads", id, filename)
        if (id == "global") filePath = path.join(process.__dirname, "public", id, filename)

        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true })
        }
    } catch (error) { }
    res.send("OK")
})

module.exports = router