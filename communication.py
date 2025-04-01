import serial
import serial.tools.list_ports
import random


class Communication:
    """
    This class handles the serial communication with the OBC
    """

    def __init__(self):
        self.baudrate = 9600
        self.ports = serial.tools.list_ports.comports()
        self.dummyPlug = False
        print("the available ports are (if none appear, press any letter): ")
        for port in sorted(self.ports):
            # obtener la lista de puetos: https://stackoverflow.com/a/52809180
            print(("{}".format(port)))
        self.portName = input("write serial port name (ex: /dev/ttyUSB0): ")
        try:
            self.ser = serial.Serial(self.portName, self.baudrate)
        except serial.serialutil.SerialException:
            print("Can't open : ", self.portName)
            self.dummyPlug = True
            print("Dummy mode activated")

    def isOpen(self):
        """
        Returns True if the port is open, False otherwise
        """
        if (self.dummyPlug == False):
            return self.ser.isOpen()
        else:
            return False

    def dummyMode(self):
        """
        Returns True if the dummy mode is activated, False otherwise
        """
        return self.dummyPlug

    def getData(self):
        if (self.dummyPlug == False):
            try:
                value = self.ser.readline()  # read line from the serial port
                decoded_bytes = str(value[0:len(value) - 2].decode("utf-8"))
                value_chain = decoded_bytes.split(",")

                # Ensure first value (time) is a valid integer
                try:
                    value_chain[0] = int(value_chain[0])
                except (ValueError, IndexError):
                    # If conversion fails, use last known time or 0
                    value_chain[0] = getattr(self, 'last_time', 0)

                # Store last valid time
                self.last_time = value_chain[0]

            except Exception as e:
                print(f"Error reading serial data: {e}")
                # Return dummy data if serial read fails
                return self.getDummyData()
        else:
            return self.getDummyData()

        return value_chain

    def getDummyData(self):
        # Generate realistic random data
        # Time (incremental)
        if not hasattr(self, 'dummy_time'):
            self.dummy_time = 0
        else:
            self.dummy_time += 1

        # Create realistic data with specified ranges
        value_chain = [
            int(self.dummy_time),  # Time (incremental) - ensure it's an integer
            random.uniform(9.5, 10),  # Altitude (0-10m)
            random.getrandbits(1),  # Free fall status (0 or 1)
            random.uniform(20, 24),  # Temperature (30-35°C)
            random.uniform(800, 850),  # Pressure (800-850 hPa)
            random.uniform(0, 5),  # Gyro pitch (0-5°)
            random.uniform(0, 5),  # Gyro roll (0-5°)
            random.uniform(0, 5),  # Gyro yaw (0-5°)
            random.uniform(0, 0),  # Acceleration X (0-5 m/s²)
            random.uniform(0, 0),  # Acceleration Y (0-5 m/s²)
            random.uniform(0, 0)  # Acceleration Z (0-5 m/s²)
        ]

        # Add some variation to make altitude change gradually
        if hasattr(self, 'last_altitude'):
            # Make altitude change by at most ±0.5m per reading
            new_altitude = self.last_altitude + random.uniform(-0.5, 0.5)
            # Keep within bounds
            new_altitude = max(0, min(10, new_altitude))
            value_chain[1] = new_altitude

        self.last_altitude = value_chain[1]
        self.last_time = value_chain[0]

        return value_chain

    def close(self):
        """
        Close the serial port
        """
        if (self.dummyPlug == False):
            self.ser.close()