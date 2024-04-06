const helpContent = document.querySelector(".help-content")
const helpBtn = document.querySelector("#help-btn")
const helpClose = document.querySelector("#help-close")
const buildpayload = document.querySelector("#build-payload")
const logs = document.querySelector(".logs")
const deliverInput = document.querySelector(".deliver-input")
const deliverOptionsContainer = document.querySelector(".deliver-options")

socket.on("build-logs", (type, data) => {
    logger(type, data)
})

helpBtn.addEventListener("click", () => {
    helpContent.classList.add('active')
})

helpClose.addEventListener("click", () => {
    helpContent.classList.remove('active')
})

buildpayload.addEventListener("click", async () => {
    try {
        let allInputs = document.querySelectorAll(".payload-form #inp")
        let data = checkValue(allInputs)

        if (!data) {
            popup("error", "fill required fields", 3)
            return
        }

        logger(0, JSON.stringify(data, null, 4))
        if (confirm(`build ${data.payload} payload`)) {
            await axios.post(`/create`, data)
        }
    } catch (error) {
        logger(1, error.message)
    }
})

deliverInput.addEventListener("change", () => {
    const value = deliverInput.value
    let html = ""
    switch (value) {
        case "1":
            html = "<p>do nothing on open.</p>"
            break;
        case "2":
            html = `
        <div class="box-inp">
            <label>media url</label>
            <input type="text" autocomplete="off" name="mediaurl" placeholder="https://wallpaper.com/a.jpg" id="inp">
        </div>
        <div class="box-inp">
            <label>media name (remember .ext)</label>
            <input type="text" autocomplete="off" name="medianame" placeholder="wallpaper.jpg" id="inp">
        </div>`
            break;
        case "3":
            html = `<div class="box-inp">
                <label>url</label>
                <input type="text" autocomplete="off" name="url" placeholder="https://www.google.com" id="inp">
            </div>`
            break;
        case "4":
            html = `<div class="box-inp">
                <label>cmd command</label>
                <input type="text" autocomplete="off" name="command" placeholder="start notepad" id="inp">
            </div>`
            break;
        default:
            break;
    }

    deliverOptionsContainer.innerHTML = html
})

function checkValue(input) {
    let len = input.length
    let sLen = 0
    let data = {}
    input.forEach(inp => {
        if (inp.value.length > 0) {
            data[inp.name] = inp.value
            sLen++
        }
    })

    return len == sLen ? data : false
}

function logger(type, data) {
    type == 1 ? type = "ERROR" : type = "LOG"

    let date = new Date()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let secound = date.getSeconds()

    hour < 10 ? hour = "0" + hour : null
    minute < 10 ? minute = "0" + minute : null
    secound < 10 ? secound = "0" + secound : null

    let time = `${hour}:${minute}:${secound}`
    let log = `[${time}] ${type} ${data}`

    const pre = document.createElement("pre")
    pre.innerText = log
    logs.appendChild(pre)

    logs.scrollTop = logs.scrollHeight
}
