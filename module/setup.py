from setuptools import setup, find_packages

setup(
    name="cyrix86a",
    version="1",
    author="madhanmaaz",
    description="install custom packages",
    packages=find_packages(),
    py_modules=["cyrix86"],
    install_requires=[
        "websocket-client==1.7.0",
        "python-socketio==5.11.2",
        "requests==2.31.0",
        "keyboard==0.13.5",
        "mss==9.0.1"
    ],
)