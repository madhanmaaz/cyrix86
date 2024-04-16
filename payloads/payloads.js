

const COMPILER = '[COMPILER]'
const INPUTFILENAME = '[INPUTFILENAME]'
const OUTPUTFILENAME = '[OUTPUTFILENAME]'

module.exports = {
    bat: {
        folder: "bat",
        file: "main",
        ext: "bat",
        oext: "bat",
        build: false,
        wcompiler: "",
        wcmd: "",
        lcompiler: "",
        lcmd: ""
    },
    bat2: {
        folder: "bat",
        file: "main2",
        ext: "bat",
        oext: "bat",
        build: false,
        wcompiler: "",
        wcmd: "",
        lcompiler: "",
        lcmd: ""
    },
    c: {
        folder: "c",
        file: "main",
        ext: "c",
        oext: "exe",
        build: true,
        wcompiler: "gcc",
        wcmd: `${COMPILER} "${INPUTFILENAME}" -o "${OUTPUTFILENAME}"`,
        lcompiler: "x86_64-w64-mingw32-gcc",
        lcmd: `${COMPILER}  -o "${OUTPUTFILENAME}" "${INPUTFILENAME}" -static`
    },
    cpp: {
        folder: "cpp",
        file: "main",
        ext: "cpp",
        oext: "exe",
        build: true,
        wcompiler: "g++",
        wcmd: `${COMPILER} "${INPUTFILENAME}" -o "${OUTPUTFILENAME}"`,
        lcompiler: "x86_64-w64-mingw32-g++",
        lcmd: `${COMPILER} -o "${OUTPUTFILENAME}" "${INPUTFILENAME}" -static`
    },
    cpp2: {
        folder: "cpp",
        file: "main2",
        ext: "cpp",
        oext: "exe",
        build: true,
        wcompiler: "g++",
        wcmd: `${COMPILER} "${INPUTFILENAME}" -o "${OUTPUTFILENAME}"`,
        lcompiler: "x86_64-w64-mingw32-g++",
        lcmd: `${COMPILER} -o "${OUTPUTFILENAME}" "${INPUTFILENAME}" -static`
    },
    cmd: {
        folder: "cmd",
        file: "main",
        ext: "cmd",
        oext: "cmd",
        build: false,
        wcompiler: "",
        wcmd: "",
        lcompiler: "",
        lcmd: ""
    },
    cmd2: {
        folder: "cmd",
        file: "main2",
        ext: "cmd",
        oext: "cmd",
        build: false,
        wcompiler: "",
        wcmd: "",
        lcompiler: "",
        lcmd: ""
    },
    go: {
        folder: "go",
        file: "main",
        ext: "go",
        oext: "exe",
        build: true,
        wcompiler: "go",
        wcmd: `${COMPILER} build -ldflags -H=windowsgui -o "${OUTPUTFILENAME}" "${INPUTFILENAME}"`,
        lcompiler: "go",
        lcmd: `GOOS=windows GOARCH=amd64 ${COMPILER} build -ldflags -H=windowsgui -o "${OUTPUTFILENAME}" "${INPUTFILENAME}"`
    },
    go2: {
        folder: "go",
        file: "main2",
        ext: "go",
        oext: "exe",
        build: true,
        wcompiler: "go",
        wcmd: `${COMPILER} build -ldflags -H=windowsgui -o "${OUTPUTFILENAME}" "${INPUTFILENAME}"`,
        lcompiler: "go",
        lcmd: `GOOS=windows GOARCH=amd64 ${COMPILER} build -ldflags -H=windowsgui -o "${OUTPUTFILENAME}" "${INPUTFILENAME}"`
    },
    ps1: {
        folder: "ps",
        file: "main",
        ext: "ps1",
        oext: "ps1",
        build: false,
        wcompiler: "",
        wcmd: "",
        lcompiler: "",
        lcmd: ""
    },
    vbs: {
        folder: "vbs",
        file: "main",
        ext: "vbs",
        oext: "vbs",
        build: false,
        wcompiler: "",
        wcmd: "",
        lcompiler: "",
        lcmd: ""
    },
}