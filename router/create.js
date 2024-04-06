const express = require("express")
const router = express.Router()
const payloads = require("../payloads/payloads")

router.route("/").get((req, res) => {
    res.render("create", {
        payloads
    })
}).post((req, res) => {
    const { generatePayload } = require("../payloads/creator")
    generatePayload(req.body)
    res.send(`OK`)
})

module.exports = router