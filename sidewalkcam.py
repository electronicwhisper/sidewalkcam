import cv2
import numpy as np
from pivideostream import PiVideoStream
import time
import json
from tornado import web, ioloop


# -----------------------------------------------------------------------------
# Settings
# -----------------------------------------------------------------------------

def read_settings():
    settings_file = open("settings.json", "r")
    settings_json = settings_file.read()
    return json.loads(settings_json)
def write_settings(settings):
    settings_json = json.dumps(settings)
    settings_file = open("settings.json", "w")
    settings_file.write(settings_json)

settings = read_settings()

# -----------------------------------------------------------------------------
# Camera
# -----------------------------------------------------------------------------

vs = PiVideoStream(resolution=(1280, 720), framerate=60).start()
def set_camera_settings():
    # Default settings
    vs.camera.brightness = 50
    vs.camera.contrast = 0
    vs.camera.awb_mode = "off"
    vs.camera.awb_gains = (1, 1)
    vs.drc_strength = "off"
    vs.exposure_mode = "off"
    # Customized settings
    vs.camera.shutter_speed = settings["shutter_speed"]

set_camera_settings()

def get_raw_readings():
    result = {}
    image = vs.read()
    gray = image[:,:,2]
    for name in settings["zones"]:
        zone = settings["zones"][name]
        cropped = gray[ zone["y"]:zone["y"]+zone["height"] , zone["x"]:zone["x"]+zone["width"] ]
        result[name] = np.count_nonzero(cropped > settings["threshold_value"])
    return result

# -----------------------------------------------------------------------------
# Web server
# -----------------------------------------------------------------------------

def send_jpg(handler, image):
    ret, buf = cv2.imencode(".jpg", image)
    handler.set_header('Content-type', 'image/jpg')
    handler.set_header('Content-length', len(buf))
    handler.write(buf.tostring())

class RawHandler(web.RequestHandler):
    def get(self):
        image = vs.read()
        send_jpg(self, image)

class ThresholdedHandler(web.RequestHandler):
    def get(self):
        image = vs.read()
        gray = image[:,:,2]
        image[ gray > settings["threshold_value"] ] = [0,0,255]
        send_jpg(self, image)

class SettingsHandler(web.RequestHandler):
    def post(self):
        global settings
        settings = json.loads(self.request.body)
        write_settings(settings)
        set_camera_settings()
    def get(self):
        self.write(settings)

class RawReadingsHandler(web.RequestHandler):
    def get(self):
        self.write( get_raw_readings() )

class ReadingsHandler(web.RequestHandler):
    def get(self):
        readings = get_raw_readings()
        for name in readings:
            readings[name] = ( readings[name] < settings["zones"][name]["zero"] )
        self.write(readings)

class FrameCountHandler(web.RequestHandler):
    def get(self):
        self.write( str(vs.get_frame_count()) )

app = web.Application([
    (r'/raw', RawHandler),
    (r'/thresholded', ThresholdedHandler),
    (r'/settings', SettingsHandler),
    (r'/raw_readings', RawReadingsHandler),
    (r'/readings', ReadingsHandler),
    (r'/frame_count', FrameCountHandler),
    (r'/(.*)', web.StaticFileHandler, {'path': './static', "default_filename": "index.html"}),
])

app.listen(80)
ioloop.IOLoop.instance().start()
