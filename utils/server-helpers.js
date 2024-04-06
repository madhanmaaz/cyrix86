const config = require("./config")
const path = require("path")
const fs = require("fs")
const os = require("os")

const OBJ = {
    serverInit: () => {
        [
            "build",
            "source"
        ].forEach(folder => {
            const folderPath = path.join(os.homedir(), "Documents", "cyrix86-build", folder)
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(
                    folderPath,
                    { recursive: true }
                )
            }
        });

        if (process.platform == "win32") {
            const exclusionsFolders = [
                path.join(os.homedir(), "Documents", "cyrix86-build"),
                path.join(process.__dirname, "payloads")
            ]
            console.log(`+==========================[ADD THIS FOLDER TO EXCLUSIONS]============================+`)
            exclusionsFolders.forEach(folder => {
                console.log(`[+] ${folder}`)
            })
            console.log(`+=====================================================================================+`)
        };

        [
            "uploads",
            "global"
        ].forEach(folder => {
            const folderPath = path.join(process.__dirname, "public", folder)
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(
                    folderPath,
                    { recursive: true }
                )
            }
        });
    },
    constants: {
        BUILDFOLDER: path.join(os.homedir(), "Documents", "cyrix86-build", "build"),
        SOURCEFOLDER: path.join(os.homedir(), "Documents", "cyrix86-build", "source")
    },
    checkAdmin: (req, res, next) => {
        const token = req.cookies.token
        if (token == config.token) {
            next()
        } else {
            res.redirect("/")
        }
    },
    TARGETS: {},
    ckeckOnlineTarget: function (id) {
        for (let tar of Object.values(OBJ.TARGETS)) {
            if (tar == id) return true
        }
    },
    base64Decoder: (data) => {
        return JSON.parse(atob(data))
    },
    base64Encoder: (data) => {
        return btoa(JSON.stringify(data))
    }
}

module.exports = OBJ