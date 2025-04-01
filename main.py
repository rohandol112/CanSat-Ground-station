import sys
from pyqtgraph.Qt import QtGui, QtCore, QtWidgets
import pyqtgraph as pg
from communication import Communication
from dataBase import data_base
from PyQt5.QtWidgets import QPushButton, QLabel
from graphs.graph_acceleration import graph_acceleration
from graphs.graph_altitude import graph_altitude
from graphs.graph_battery import graph_battery
from graphs.graph_free_fall import graph_free_fall
from graphs.graph_gyro import graph_gyro
from graphs.graph_pressure import graph_pressure
from graphs.graph_speed import graph_speed
from graphs.graph_temperature import graph_temperature
from graphs.graph_time import graph_time
from PyQt5 import QtWidgets, QtCore, QtGui
from PyQt5.QtGui import QFont, QColor, QPalette, QIcon
from PyQt5.QtCore import Qt, QTimer
import serial
import serial.tools.list_ports
import os

# Create data directory if it doesn't exist
if not os.path.exists('data'):
    os.makedirs('data')

# Set application-wide font
app_font = QFont("Segoe UI", 9)
title_font = QFont("Segoe UI Semibold", 12)
subtitle_font = QFont("Segoe UI", 10)

# Custom colors - Modern dark theme
DARK_BLUE = "#0d1117"  # Dark background
MEDIUM_BLUE = "#161b22"  # Panel background
LIGHT_BLUE = "#21262d"  # Border color
ACCENT_COLOR = "#58a6ff"  # Primary accent
ACCENT_COLOR_2 = "#3fb950"  # Secondary accent (green)
ACCENT_COLOR_3 = "#f85149"  # Tertiary accent (red)
TEXT_COLOR = "#c9d1d9"  # Main text
GRID_COLOR = "#30363d"  # Grid lines

# Graph colors - Vibrant palette
ALTITUDE_COLOR = "#58a6ff"  # Blue
SPEED_COLOR = "#f0883e"  # Orange
TIME_COLOR = "#d2a8ff"  # Purple
ACCEL_X_COLOR = "#f85149"  # Red
ACCEL_Y_COLOR = "#3fb950"  # Green
ACCEL_Z_COLOR = "#58a6ff"  # Blue
GYRO_PITCH_COLOR = "#f85149"  # Red
GYRO_ROLL_COLOR = "#3fb950"  # Green
GYRO_YAW_COLOR = "#58a6ff"  # Blue
PRESSURE_COLOR = "#79c0ff"  # Light blue
TEMP_COLOR = "#f0883e"  # Orange
FREE_FALL_COLOR = "#f85149"  # Red

# Set global pyqtgraph options
pg.setConfigOption('background', DARK_BLUE)
pg.setConfigOption('foreground', TEXT_COLOR)

# Interface variables
app = QtWidgets.QApplication(sys.argv)
app.setFont(app_font)  # Set application-wide font

# Create main view
view = pg.GraphicsView()
Layout = pg.GraphicsLayout()
view.setCentralItem(Layout)
view.show()
view.setWindowTitle('CanSat Flight Monitoring')
view.resize(1200, 700)

# Set application icon (if available)
try:
    app.setWindowIcon(QIcon('icon.png'))
except:
    pass

# declare object for serial Communication
ser = Communication()
# declare object for storage in CSV
data_base = data_base()

# Fonts for text items
font = QtGui.QFont("Segoe UI", 11)
font.setPixelSize(90)

# Button styles
start_button_style = """
    QPushButton {
        background-color: #3fb950;
        color: #ffffff;
        font-size: 14px;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
    }
    QPushButton:hover {
        background-color: #2ea043;
    }
    QPushButton:pressed {
        background-color: #238636;
    }
"""

stop_button_style = """
    QPushButton {
        background-color: #f85149;
        color: #ffffff;
        font-size: 14px;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
    }
    QPushButton:hover {
        background-color: #da3633;
    }
    QPushButton:pressed {
        background-color: #b62324;
    }
"""

# Declare graphs
# Button 1
proxy = QtWidgets.QGraphicsProxyWidget()
save_button = QtWidgets.QPushButton('Start Recording')
save_button.setStyleSheet(start_button_style)
save_button.clicked.connect(data_base.start)
proxy.setWidget(save_button)

# Button 2
proxy2 = QtWidgets.QGraphicsProxyWidget()
end_save_button = QtWidgets.QPushButton('Stop Recording')
end_save_button.setStyleSheet(stop_button_style)
end_save_button.clicked.connect(data_base.stop)
proxy2.setWidget(end_save_button)

# Altitude graph
altitude = graph_altitude()
# Speed graph
speed = graph_speed()
# Acceleration graph
acceleration = graph_acceleration()
# Gyro graph
gyro = graph_gyro()
# Pressure Graph
pressure = graph_pressure()
# Temperature graph
temperature = graph_temperature()
# Time graph
time = graph_time(font=font)
# Battery graph
battery = graph_battery(font=font)
# Free fall graph
free_fall = graph_free_fall(font=font)

# No custom styling for graphs to avoid errors

## Setting the graphs in the layout
# Title at top with improved styling
title_html = """
<div style='text-align: center; color: #c9d1d9;'>
    <span style='font-size: 18px; font-weight: bold; color: #58a6ff;'>CubeSat Flight Monitoring System</span><br>
    <span style='font-size: 12px;'>Developed at TCET Vyom Voyage</span>
</div>
"""
Layout.addLabel(title_html, col=1, colspan=21)
Layout.nextRow()

# Put vertical label on left side with improved styling
side_label = Layout.addLabel('LIDER - ATL Research Hotbed', angle=-90, rowspan=3)
side_label.item.setFont(QFont("Segoe UI Semibold", 10))
side_label.item.setDefaultTextColor(QColor(ACCENT_COLOR))

Layout.nextRow()

# Button layout with improved spacing
lb = Layout.addLayout(colspan=21)
lb.addItem(proxy)
lb.nextCol()
lb.addItem(proxy2)

# Add status indicator
status_proxy = QtWidgets.QGraphicsProxyWidget()
status_label = QLabel("Status: Running in Dummy Mode")
status_label.setStyleSheet(f"color: {ACCENT_COLOR}; font-size: 12px; font-weight: bold; background-color: transparent;")
status_proxy.setWidget(status_label)
lb.nextCol()
lb.addItem(status_proxy)

Layout.nextRow()

# Main layout with improved borders and spacing
l1 = Layout.addLayout(colspan=20, rowspan=2)
l11 = l1.addLayout(rowspan=1, border=(LIGHT_BLUE))

# Altitude, speed
l11.addItem(altitude)
l11.addItem(speed)
l1.nextRow()

# Acceleration, gyro, pressure, temperature
l12 = l1.addLayout(rowspan=1, border=(LIGHT_BLUE))
l12.addItem(acceleration)
l12.addItem(gyro)
l12.addItem(pressure)
l12.addItem(temperature)

# Time, battery and free fall graphs
l2 = Layout.addLayout(border=(LIGHT_BLUE))
l2.addItem(time)
l2.nextRow()
l2.addItem(battery)
l2.nextRow()
l2.addItem(free_fall)

# Add timestamp display
timestamp_proxy = QtWidgets.QGraphicsProxyWidget()
timestamp_label = QLabel("Session started: " + QtCore.QDateTime.currentDateTime().toString("yyyy-MM-dd hh:mm:ss"))
timestamp_label.setStyleSheet(f"color: {TEXT_COLOR}; font-size: 10px; background-color: transparent;")
timestamp_proxy.setWidget(timestamp_label)
Layout.nextRow()
Layout.addItem(timestamp_proxy, col=1, colspan=21)


# Update function with error handling
def update():
    try:
        value_chain = []
        value_chain = ser.getData()

        # Update all graphs
        altitude.update(value_chain[1])
        speed.update(value_chain[8], value_chain[9], value_chain[10])
        time.update(value_chain[0])
        acceleration.update(value_chain[8], value_chain[9], value_chain[10])
        gyro.update(value_chain[5], value_chain[6], value_chain[7])
        pressure.update(value_chain[4])
        temperature.update(value_chain[3])
        free_fall.update(value_chain[2])
        data_base.guardar(value_chain)

        # Update status label
        if ser.dummyMode():
            status_label.setText(f"Status: Running in Dummy Mode | Time: {value_chain[0]}")
        else:
            status_label.setText(f"Status: Connected to {ser.portName} | Time: {value_chain[0]}")

    except IndexError:
        status_label.setText("Status: Starting, please wait a moment...")
    except Exception as e:
        status_label.setText(f"Status: Error - {str(e)}")


if (ser.isOpen()) or (ser.dummyMode()):
    timer = pg.QtCore.QTimer()
    timer.timeout.connect(update)
    timer.start(500)
else:
    print("Something is wrong with the update call")
    status_label.setText("Status: Connection Error")

# Start Qt event loop unless running in interactive mode.
if __name__ == '__main__':
    if (sys.flags.interactive != 1) or not hasattr(QtCore, 'PYQT_VERSION'):
        QtWidgets.QApplication.instance().exec_()