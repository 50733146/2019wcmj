import socket
import sys
import logging

from PyQt5.QtCore import QThread, QUrl
from PyQt5.QtGui import QIcon
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtWidgets import QApplication, QHBoxLayout, QPushButton


class QFlask:
    def __init__(self, app):
        self.app = app

    def run(self, title='QFlask Application', icon=None, width=640, height=480, zoom=1, **options):
        """Runs the application in a QtWebEngineView.

        :param title: window title.
        :param icon: path to a window icon.
        :param width: initial width of the window.
        :param height: initial height of the window.
        :param zoom: zoom factor of the web content. defaults to 1.
        :param options: the options to be forwarded to the underlying
                        Werkzeug server.
        """

        # Determine free port
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
        sock.close()

        logging.debug('QFlask initialized on port ' + str(port))

        # Start application and flask thread
        qApp = QApplication(sys.argv)
        fApp = FlaskThread(self.app, port, **options)
        fApp.start()

        qApp.aboutToQuit.connect(fApp.terminate)
        view = WebEngineView()
        view.load(QUrl('http://127.0.0.1:' + str(port)))

        view.resize(width, height)
        view.setZoomFactor(zoom)
        view.setWindowTitle(title)
        if icon is not None:
            view.setWindowIcon(QIcon(icon))

        view.show()

        sys.exit(qApp.exec_())


# Separate Thread for Flask
class FlaskThread(QThread):
    def __init__(self, app, port, **options):
        QThread.__init__(self)
        self.app = app
        self.port = port
        self.options = options

    def __del__(self):
        self.wait()

    def run(self):
        self.app.run(host='127.0.0.1', port=self.port, **self.options)


# Own View to suppress various events
class WebEngineView(QWebEngineView):
    def __init__(self):
        super().__init__(None)

    def dragEnterEvent(self, e):
        e.ignore()

    def dropEvent(self, e):
        e.ignore()

    def contextMenuEvent(self, e):
        pass
        

import flaskapp

'''
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello World!'
'''

if __name__ == '__main__':
    #from qflask import QFlask
    QFlask(flaskapp.app).run(title='CMSimfly App', zoom=1.5)