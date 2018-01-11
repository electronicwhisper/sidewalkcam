# camweb

This script will stream the raspberry pi camera feed as a web server.


## Usage

Run with:

    python camweb.py

Now you can go to:

* http://rpicam2.local/raw
* http://rpicam2.local/thresholded

(where rpicam2 is the hostname of your raspberry pi)

You can change the camera settings (shutter speed, etc.) by modifying `settings.json`. It will update in real time.


## Installation on Raspberry Pi

You can use [PiBakery](http://www.pibakery.org/) and `pi-image-camweb.xml` to create a raspberry pi disk image that will automatically install the required packages and run camweb on startup.

Make sure to change the hostname to whatever you want to name it.

![screenshot](pibakery-screenshot.png)


## Manual Installation Instructions

Here are all the things you need to install (on Raspbian Lite) to make this work:

    sudo apt-get update
    sudo apt-get upgrade

    sudo apt-get install build-essential python-dev python-pip

    sudo apt-get install python-opencv

    sudo pip install "picamera[array]"
    sudo pip install imutils

    sudo apt-get install libzmq3-dev
    sudo pip install pyzmq

    sudo pip install commentjson
    sudo pip install tornado

Ensure the camera is enabled here:

    sudo raspi-config

You can test the camera with:

    raspistill -t 0
