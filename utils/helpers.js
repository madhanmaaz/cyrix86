const config = require('../config')
const fs = require("node:fs")

module.exports = {
    BROWSER_CLIENTS: {},
    PYTHON_CLIENTS: {},
    GLOBAL_CLIENTS: {},

    authorization(req, res, next) {
        const { token } = req.cookies

        if (!token || token !== config.token) {
            res.clearCookie("token")
            return res.redirect("/")
        }

        next()
    },
    randomString(length) {
        let result = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    },
    readJson(path) {
        try {
            return JSON.parse(fs.readFileSync(path))
        } catch (error) {
            return {}
        }
    },
    writeJson(path, data) {
        try {
            fs.writeFileSync(path, JSON.stringify(Object.assign(this.readJson(path), data)))
        } catch (error) {}
    },
}