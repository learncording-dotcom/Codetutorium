#!/usr/bin/env python3
"""
Phone Mirror Client - Python Implementation
Handles device connection and screen capture
"""

import socketio
import cv2
import numpy as np
import base64
import json
import argparse
import threading
import time
from datetime import datetime

class PhoneMirrorClient:
    def __init__(self, server_url, session_id, session_token, device_name='Mirror-Device'):
        self.server_url = server_url
        self.session_id = session_id
        self.session_token = session_token
        self.device_name = device_name
        self.sio = socketio.Client()
        self.connected = False
        self.mirroring = False
        self.frame_count = 0
        
        # Register event handlers
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup WebSocket event handlers"""
        @self.sio.on('connect')
        def on_connect():
            print('Connected to server')
            self.connected = True
            self.device_connect()
        
        @self.sio.on('disconnect')
        def on_disconnect():
            print('Disconnected from server')
            self.connected = False
            self.mirroring = False
        
        @self.sio.on('mirror:started')
        def on_mirror_started():
            print('Mirror session started')
            self.mirroring = True
            self.start_screen_capture()
        
        @self.sio.on('mirror:stopped')
        def on_mirror_stopped():
            print('Mirror session stopped')
            self.mirroring = False
        
        @self.sio.on('input:execute')
        def on_input_command(data):
            print(f'Received input command: {data}')
            self.execute_input(data)
        
        @self.sio.on('error')
        def on_error(data):
            print(f'Error: {data}')
    
    def device_connect(self):
        """Connect device to mirror session"""
        device_info = {
            'deviceName': self.device_name,
            'platform': 'Android',
            'resolution': '1080x2340',
            'timestamp': datetime.now().isoformat()
        }
        
        self.sio.emit('device:connect', {
            'sessionId': self.session_id,
            'sessionToken': self.session_token,
            'deviceInfo': device_info
        })
        
        print(f'Device {self.device_name} connected to session {self.session_id}')
    
    def start_screen_capture(self):
        """Start capturing screen frames"""
        capture_thread = threading.Thread(target=self._capture_frames, daemon=True)
        capture_thread.start()
    
    def _capture_frames(self):
        """Capture and send screen frames"""
        # For demo: generate dummy frames
        frame_width, frame_height = 1080, 2340
        
        while self.mirroring and self.connected:
            try:
                # Create dummy frame (in real implementation, use device screen capture API)
                frame = np.random.randint(0, 255, (frame_height, frame_width, 3), dtype=np.uint8)
                
                # Encode frame
                _, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Send frame
                self.sio.emit('screen:frame', {
                    'sessionId': self.session_id,
                    'frameData': frame_base64,
                    'timestamp': datetime.now().isoformat()
                })
                
                self.frame_count += 1
                time.sleep(0.033)  # ~30 FPS
                
            except Exception as e:
                print(f'Error capturing frame: {e}')
    
    def execute_input(self, command):
        """Execute input command from viewer"""
        command_type = command.get('type')
        
        if command_type == 'tap':
            x, y = command.get('x'), command.get('y')
            print(f'Tap at ({x}, {y})')
        elif command_type == 'swipe':
            start_x, start_y = command.get('startX'), command.get('startY')
            end_x, end_y = command.get('endX'), command.get('endY')
            print(f'Swipe from ({start_x}, {start_y}) to ({end_x}, {end_y})')
        elif command_type == 'key':
            key_code = command.get('keyCode')
            print(f'Key press: {key_code}')
    
    def connect(self):
        """Connect to server"""
        try:
            self.sio.connect(self.server_url)
            print(f'Connecting to {self.server_url}...')
        except Exception as e:
            print(f'Connection error: {e}')
    
    def disconnect(self):
        """Disconnect from server"""
        self.mirroring = False
        if self.connected:
            self.sio.disconnect()


def main():
    parser = argparse.ArgumentParser(description='Phone Mirror Client')
    parser.add_argument('--server', default='http://localhost:3000', help='Server URL')
    parser.add_argument('--session-id', required=True, help='Session ID')
    parser.add_argument('--session-token', required=True, help='Session Token')
    parser.add_argument('--device-name', default='Mirror-Device', help='Device name')
    
    args = parser.parse_args()
    
    client = PhoneMirrorClient(
        server_url=args.server,
        session_id=args.session_id,
        session_token=args.session_token,
        device_name=args.device_name
    )
    
    client.connect()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('\nShutting down...')
        client.disconnect()


if __name__ == '__main__':
    main()
