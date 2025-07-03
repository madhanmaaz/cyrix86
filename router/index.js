const express = require('express')
const config = require('../config')
const router = express.Router()

router.get("/", (req, res) => {
    const { token } = req.cookies

    if (token) {
        return res.redirect("/home")
    }

    res.render("login")
})

router.post("/", (req, res) => {
    const { username, password } = req.body

    if (username === config.username && password === config.password) {
        res.cookie("token", config.token, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        })

        return res.redirect("/home")
    }

    res.clearCookie("token")
    res.render("login")
})


module.exports = router