const express = require('express')
const path = require("node:path")

const clientManager = require('../utils/clientManager')
const helpers = require('../utils/helpers')
const router = express.Router()

router.post("/", async (req, res) => {
    try {
        const { id, type } = req.body
        if (!id || !type) return res.sendStatus(400)


        if (req.files) {
            const postFile = req.files.file
            const filePath = path.join(helpers.clientsFolderPath, id, postFile.name)

            postFile.mv(filePath, (err) => {
                clientManager.emitDataToBrowser(id, {
                    type,
                    output: err ? "Error while receiving file" : "File received successfully",
                    url: err ? false : `/storage/download/${id}/${postFile.name}`
                })
            })
        }
    } catch (error) { }

    res.sendStatus(200)
})

module.exports = router