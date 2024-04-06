const socket = io("", {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
})

let marginTop = 0
function popup(title, content, timer = undefined) {
    const popups = document.querySelectorAll(".popup-container")
    const div = document.createElement("div")
    div.style.marginTop = `${marginTop}rem`
    div.className = "popup-container"

    if (popups.length > 1) {
        div.innerHTML = `
        <div class="popup-head">
            <i class="fa-solid fa-bell"></i>
            <b>${title}</b>

            <div class="right">
                <i class="fa-solid fa-trash-can"></i>
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
        <div class="popup-content">${content}</div>`

        div.querySelector(".fa-trash-can").addEventListener("click", () => {
            document.querySelectorAll(".popup-container").forEach(pup => {
                pup.remove()
                marginTop = 0
            })
        })
    } else {
        div.innerHTML = `
        <div class="popup-head">
            <i class="fa-solid fa-bell"></i>
            <b>${title}</b>
            <i class="fa-solid fa-xmark"></i>
        </div>
        <div class="popup-content">${content}</div>`
    }

    div.querySelector(".fa-xmark").addEventListener("click", () => {
        div.remove()
        marginTop--
    })

    document.body.appendChild(div)
    marginTop++

    if (timer) {
        setTimeout(() => {
            marginTop = 0
            div.remove()
        }, timer * 1000)
    }
}

socket.on(`gl-msg`, data => {
    popup(data.title, data.value)
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tool-title").forEach(btn => {
        btn.querySelector("p").addEventListener('click', () => {
            location.href = "/"
        })

        btn.querySelector("small").addEventListener('click', () => {
            location.href = "https://madhanmaaz.netlify.app"
        })
    })
})