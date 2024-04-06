const { checkAdmin, ckeckOnlineTarget } = require("../utils/server-helpers")
const config = require("../utils/config")
const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")

router.route("/").get((req, res) => {
    const token = req.cookies.token

    if (token == undefined) {
        res.render("login")
        return
    }

    if (token != config.token) {
        res.clearCookie("token").redirect("/")
        return
    }

    const data = []
    for (const id of fs.readdirSync(path.join(process.__dirname, "public", "uploads"))) {
        data.push({
            id,
            online: ckeckOnlineTarget(id)
        })
    }

    res.render("index", {
        data
    })
}).post((req, res) => {
    const { username, password } = req.body

    if (config.username == username && config.password == password) {
        res.cookie("token", config.token, { maxAge: 100000000 * 1000000 })
    }

    res.redirect("/")
})

router.get("/cyrix86", (req, res) => {
    res.send("cyrix-OK")
})

// admin check
router.use(checkAdmin)

router.get("/del-tar", (req, res) => {
    const { id } = req.query

    try {
        fs.rmSync(path.join(process.__dirname, 'public', 'uploads', id), { recursive: true })
    } catch (error) { console.log(error) }

    res.send("OK")
})


router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/")
})

module.exports = router