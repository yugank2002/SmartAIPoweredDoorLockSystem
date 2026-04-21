import tkinter as tk
from tkinter import ttk, messagebox
import threading
import cv2
from PIL import Image, ImageTk
import io
import requests

# Config - adjust if your backend uses a different host/port
BACKEND_BASE = "http://localhost:5000"  # will POST to /api/auth/login and /verify
LOGIN_URL = BACKEND_BASE + "/api/auth/login"
LOGOUT_URL = BACKEND_BASE + "/api/auth/logout"
VERIFY_URL = BACKEND_BASE + "/verify"

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Smart Lock - Verification Client")
        self.protocol("WM_DELETE_WINDOW", self.on_close)
        self.session = requests.Session()
        self.user = None  # dict with id, name, email
        self.cap = None
        self.running = False
        self.current_frame = None

        self.create_login_frame()

    def create_login_frame(self):
        self.clear_frames()
        self.login_frame = ttk.Frame(self, padding=20)
        self.login_frame.grid(row=0, column=0)

        ttk.Label(self.login_frame, text="Login", font=(None, 16)).grid(column=0, row=0, columnspan=2, pady=(0,10))

        ttk.Label(self.login_frame, text="Email:").grid(column=0, row=1, sticky=tk.W)
        self.email_var = tk.StringVar()
        ttk.Entry(self.login_frame, textvariable=self.email_var, width=30).grid(column=1, row=1)

        ttk.Label(self.login_frame, text="Password:").grid(column=0, row=2, sticky=tk.W)
        self.password_var = tk.StringVar()
        ttk.Entry(self.login_frame, textvariable=self.password_var, width=30, show="*").grid(column=1, row=2)

        self.login_btn = ttk.Button(self.login_frame, text="Login", command=self.handle_login)
        self.login_btn.grid(column=0, row=3, columnspan=2, pady=10)

    def create_camera_frame(self):
        self.clear_frames()
        self.camera_frame = ttk.Frame(self, padding=10)
        self.camera_frame.grid(row=0, column=0)

        header = ttk.Frame(self.camera_frame)
        header.grid(row=0, column=0, sticky=tk.EW)
        ttk.Label(header, text=f"Logged in as: {self.user.get('name')}", font=(None,12)).pack(side=tk.LEFT)
        ttk.Button(header, text="Logout", command=self.handle_logout).pack(side=tk.RIGHT)

        # Video display
        self.video_label = ttk.Label(self.camera_frame)
        self.video_label.grid(row=1, column=0, pady=10)

        controls = ttk.Frame(self.camera_frame)
        controls.grid(row=2, column=0, sticky=tk.EW)

        # Single capture button (no visitor name required)
        self.capture_btn = ttk.Button(controls, text="Capture & Verify", command=self.handle_capture)
        self.capture_btn.grid(column=0, row=0, pady=8)

        self.status_var = tk.StringVar()
        ttk.Label(self.camera_frame, textvariable=self.status_var, foreground='green').grid(row=3, column=0)

        # start camera
        self.start_camera()

    def clear_frames(self):
        for widget in self.winfo_children():
            widget.destroy()

    def handle_login(self):
        email = self.email_var.get().strip()
        password = self.password_var.get().strip()
        if not email or not password:
            messagebox.showwarning("Validation", "Please enter email and password")
            return

        self.login_btn.config(state=tk.DISABLED)
        threading.Thread(target=self._login_thread, args=(email, password), daemon=True).start()

    def _login_thread(self, email, password):
        try:
            resp = self.session.post(LOGIN_URL, json={"email": email, "password": password}, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                self.user = data.get('user')
                self.after(0, self.create_camera_frame)
            else:
                err = resp.json().get('message') if resp.headers.get('Content-Type','').startswith('application/json') else resp.text
                messagebox.showerror("Login failed", f"{resp.status_code}: {err}")
        except Exception as e:
            messagebox.showerror("Error", str(e))
        finally:
            self.login_btn.config(state=tk.NORMAL)

    def start_camera(self):
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            messagebox.showerror("Camera Error", "Could not open camera")
            return
        self.running = True
        self.update_frame()

    def update_frame(self):
        if not self.running:
            return
        ret, frame = self.cap.read()
        if ret:
            # store current frame (BGR)
            self.current_frame = frame.copy()
            # convert to RGB then to PIL image
            cv2image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(cv2image)
            imgtk = ImageTk.PhotoImage(image=img.resize((480,360)))
            self.video_label.imgtk = imgtk
            self.video_label.config(image=imgtk)
        self.after(30, self.update_frame)

    def handle_capture(self):
        if self.current_frame is None:
            messagebox.showwarning("No frame", "No camera frame available")
            return
        # No visitor name required; capture and send with logged-in user id
        # compress to JPEG in memory
        is_success, buffer = cv2.imencode('.jpg', self.current_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        if not is_success:
            messagebox.showerror("Error", "Failed to encode image")
            return
        img_bytes = io.BytesIO(buffer.tobytes())

        threading.Thread(target=self._upload_thread, args=(img_bytes,), daemon=True).start()

    def _upload_thread(self, img_bytes):
        try:
            self.after(0, lambda: self.status_var.set('Uploading...'))
            files = {'photo': ('capture.jpg', img_bytes.getvalue(), 'image/jpeg')}
            data = {'userId': self.user.get('id') if self.user else ''}
            resp = self.session.post(VERIFY_URL, files=files, data=data, timeout=60)
            if resp.status_code in (200, 201):
                result = resp.json()
                decision = result.get('decision', 'unknown').upper()
                visitor_name = result.get('visitorName', 'Unknown Visitor')
                best_match = result.get('best_match', {})
                
                # Display result based on decision
                if decision == 'ALLOWED':
                    self.after(0, lambda: self.status_var.set('✓ ALLOWED'))
                    msg = f"Access ALLOWED\n\nRecognized: {visitor_name}\nConfidence: {(1-best_match.get('distance', 1))*100:.1f}%"
                    messagebox.showinfo('Access Granted', msg)
                else:
                    self.after(0, lambda: self.status_var.set('✗ REJECTED'))
                    msg = "Access REJECTED\n\nVisitor not recognized in database"
                    messagebox.showwarning('Access Denied', msg)
            else:
                try:
                    err = resp.json().get('message')
                except Exception:
                    err = resp.text
                messagebox.showerror('Verification failed', f"{resp.status_code}: {err}")
        except Exception as e:
            messagebox.showerror('Error', str(e))
        finally:
            self.after(0, lambda: self.status_var.set(''))

    def handle_logout(self):
        try:
            # call server logout (optional)
            self.session.post(LOGOUT_URL)
        except Exception:
            pass
        self.user = None
        # stop camera
        self.running = False
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None
        self.create_login_frame()

    def on_close(self):
        self.running = False
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
        try:
            self.destroy()
        except Exception:
            pass

if __name__ == '__main__':
    app = App()
    app.mainloop()
