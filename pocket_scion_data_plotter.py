#!/usr/bin/env python3
"""
Pocket Scion Data Plotter
A GUI application for plotting and analyzing pocket scion data.
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
from matplotlib.figure import Figure
import numpy as np
from collections import deque
import threading
import time
import json
from datetime import datetime
from pythonosc.dispatcher import Dispatcher
from pythonosc.osc_server import ThreadingOSCUDPServer

# Constants for 555 Timer calculations
K_555 = 0.693
C_555 = 4.3e-9  # F
RA_555 = 100_000.0  # Ω

# OSC Configuration
OSC_IP = "127.0.0.1"
OSC_PORT = 11045

# Dark Theme Colors
BG_COLOR = "#2B2B2B"
PANEL_COLOR = "#3C3C3C"
ACCENT_COLOR = "#4CAF50"
TEXT_COLOR = "#E0E0E0"
GRID_COLOR = "#555555"
BUTTON_COLOR = "#4CAF50"
BUTTON_DANGER = "#F44336"
BUTTON_INFO = "#2196F3"


class ClickableLabel(tk.Frame):
    """A label-based button that avoids macOS focus styling issues."""
    
    def __init__(self, parent, text, command, **kwargs):
        # Extract styling options
        self.bg = kwargs.get('bg', BUTTON_COLOR)
        self.fg = kwargs.get('fg', 'white')
        self.font = kwargs.get('font', ('Arial', 10, 'bold'))
        self.padx = kwargs.get('padx', 15)
        self.pady = kwargs.get('pady', 5)
        self.command = command
        
        # Create frame
        super().__init__(parent, bg=self.bg, relief=tk.FLAT, bd=0, 
                        highlightthickness=0, cursor='hand2')
        
        # Create label
        self.label = tk.Label(self, text=text, bg=self.bg, fg=self.fg, 
                             font=self.font, cursor='hand2')
        self.label.pack(padx=self.padx, pady=self.pady)
        
        # Bind click events
        self.bind('<Button-1>', self._on_click)
        self.label.bind('<Button-1>', self._on_click)
        
        # Bind hover events
        self.bind('<Enter>', self._on_enter)
        self.bind('<Leave>', self._on_leave)
        self.label.bind('<Enter>', self._on_enter)
        self.label.bind('<Leave>', self._on_leave)
    
    def _on_click(self, event):
        """Handle click event."""
        if self.command:
            self.command()
    
    def _on_enter(self, event):
        """Handle mouse enter - slightly brighten color."""
        # Create a slightly brighter version of the background color
        try:
            # Convert hex to RGB
            hex_color = self.bg.lstrip('#')
            r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            # Brighten by 20%
            r = min(255, int(r * 1.2))
            g = min(255, int(g * 1.2))
            b = min(255, int(b * 1.2))
            bright_color = f'#{r:02x}{g:02x}{b:02x}'
            self.configure(bg=bright_color)
            self.label.configure(bg=bright_color)
        except:
            pass  # Fall back to original color if conversion fails
    
    def _on_leave(self, event):
        """Handle mouse leave - restore original color."""
        self.configure(bg=self.bg)
        self.label.configure(bg=self.bg)
    
    def configure(self, **kwargs):
        """Override configure to update both frame and label."""
        super().configure(**kwargs)
        if 'bg' in kwargs:
            self.label.configure(bg=kwargs['bg'])
        if 'fg' in kwargs:
            self.label.configure(fg=kwargs['fg'])


class OSCReceiver:
    """Handles OSC data reception for pocket scion data."""
    
    def __init__(self, on_sample_callback):
        self.on_sample_callback = on_sample_callback
        self.last_edge_ms = None
        self.server = None
        self.thread = None
        self.is_receiving = False
        self.last_rx_time = 0.0
        self.lock = threading.Lock()

    @staticmethod
    def edge_to_ms(v):
        """Convert edge value to milliseconds."""
        v = float(v)
        return v / 1000.0 if v > 1000 else v

    @staticmethod
    def period_to_mohm(T_ms):
        """Convert period to mega-ohms resistance."""
        T_s = T_ms / 1000.0
        if T_s <= 0:
            return None
        RB = (T_s / (K_555 * C_555) - RA_555) / 2.0
        return max(RB, 0.0) / 1e6

    def mean_handler(self, address, *args):
        """Handle OSC mean messages."""
        edge_ms = self.edge_to_ms(args[0])
        with self.lock:
            if self.last_edge_ms is None:
                self.last_edge_ms = edge_ms
                return
            T_ms = self.last_edge_ms + edge_ms
            self.last_edge_ms = edge_ms
        R = self.period_to_mohm(T_ms)
        if R is None:
            return
        now = time.time()
        self.is_receiving = True
        self.last_rx_time = now
        self.on_sample_callback(now, R)

    def deviation_handler(self, address, *args):
        """Handle OSC deviation messages."""
        edge_ms = self.edge_to_ms(args[0])
        R = self.period_to_mohm(edge_ms * 2)  # Approximate deviation
        if R is None:
            return
        now = time.time()
        self.is_receiving = True
        self.last_rx_time = now
        self.on_sample_callback(now, R, data_type='deviation')

    def start(self):
        """Start the OSC server."""
        try:
            dispatcher = Dispatcher()
            dispatcher.map("/mean", self.mean_handler)
            dispatcher.map("/deviation", self.deviation_handler)
            self.server = ThreadingOSCUDPServer((OSC_IP, OSC_PORT), dispatcher)
            self.thread = threading.Thread(
                target=self.server.serve_forever, daemon=True)
            self.thread.start()
            return True
        except OSError as e:
            return str(e)

    def stop(self):
        """Stop the OSC server."""
        if self.server:
            try:
                self.server.shutdown()
            except Exception:
                pass

    @property
    def signal_ok(self):
        """Check if signal is being received."""
        return self.is_receiving and (time.time() - self.last_rx_time) < 3.0


class ScionPlotterApp:
    """Main application class for the Pocket Scion Plotter."""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Pocket Scion Data Plotter")
        self.root.geometry("1200x900")
        self.root.configure(bg=BG_COLOR)
        
        # Data storage
        self.mean_data = deque(maxlen=1000)
        self.deviation_data = deque(maxlen=1000)
        self.time_offset = None
        
        # OSC receiver
        self.osc_receiver = None
        
        # Plotting options
        self.show_mean = tk.BooleanVar(value=True)
        self.show_deviation = tk.BooleanVar(value=True)
        self.auto_scale = tk.BooleanVar(value=True)
        
        # Build GUI
        self.build_gui()
        
        # Start OSC receiver
        self.start_osc_receiver()
        
        # Start update loop
        self.update_plot()

    def build_gui(self):
        """Build the main GUI layout."""
        # Main container
        main_frame = tk.Frame(self.root, bg=BG_COLOR)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Top control panel
        self.build_control_panel(main_frame)
        
        # Plot area
        self.build_plot_area(main_frame)
        
        # Bottom status bar
        self.build_status_bar(main_frame)

    def build_control_panel(self, parent):
        """Build the control panel with options."""
        control_frame = tk.Frame(parent, bg=PANEL_COLOR, relief=tk.RAISED, bd=1)
        control_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Compact title row
        title_row = tk.Frame(control_frame, bg=PANEL_COLOR)
        title_row.pack(fill=tk.X, padx=10, pady=(8, 5))
        
        title_label = tk.Label(title_row, text="Pocket Scion Data Plotter",
                               font=("Arial", 12, "bold"), bg=PANEL_COLOR, fg=ACCENT_COLOR)
        title_label.pack(side=tk.LEFT)
        
        # Controls container - more compact horizontal layout
        controls = tk.Frame(control_frame, bg=PANEL_COLOR)
        controls.pack(fill=tk.X, padx=10, pady=(0, 8))
        
        # Data selection - more compact
        data_frame = tk.Frame(controls, bg=PANEL_COLOR)
        data_frame.pack(side=tk.LEFT, padx=(0, 20))
        
        tk.Label(data_frame, text="Data:", bg=PANEL_COLOR, fg=TEXT_COLOR, 
                font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=(0, 5))
        tk.Checkbutton(data_frame, text="Mean", variable=self.show_mean,
                      bg=PANEL_COLOR, fg=TEXT_COLOR, selectcolor=PANEL_COLOR, font=("Arial", 9)).pack(side=tk.LEFT, padx=2)
        tk.Checkbutton(data_frame, text="Deviation", variable=self.show_deviation,
                      bg=PANEL_COLOR, fg=TEXT_COLOR, selectcolor=PANEL_COLOR, font=("Arial", 9)).pack(side=tk.LEFT, padx=2)
        
        # Plot options - more compact
        plot_frame = tk.Frame(controls, bg=PANEL_COLOR)
        plot_frame.pack(side=tk.LEFT, padx=(0, 20))
        
        tk.Label(plot_frame, text="Options:", bg=PANEL_COLOR, fg=TEXT_COLOR,
                font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=(0, 5))
        tk.Checkbutton(plot_frame, text="Auto Scale", variable=self.auto_scale,
                      bg=PANEL_COLOR, fg=TEXT_COLOR, selectcolor=PANEL_COLOR, font=("Arial", 9)).pack(side=tk.LEFT)
        
        # Action buttons - horizontal layout
        button_frame = tk.Frame(controls, bg=PANEL_COLOR)
        button_frame.pack(side=tk.LEFT)
        
        ClickableLabel(button_frame, text="Clear", command=self.clear_data,
                 bg=BUTTON_DANGER, fg="white", font=("Arial", 9, "bold"),
                 padx=10, pady=3).pack(side=tk.LEFT, padx=2)
        
        ClickableLabel(button_frame, text="Save", command=self.save_plot,
                 bg=BUTTON_COLOR, fg="white", font=("Arial", 9, "bold"),
                 padx=10, pady=3).pack(side=tk.LEFT, padx=2)
        
        ClickableLabel(button_frame, text="Export", command=self.export_data,
                 bg=BUTTON_INFO, fg="white", font=("Arial", 9, "bold"),
                 padx=10, pady=3).pack(side=tk.LEFT, padx=2)

    def build_plot_area(self, parent):
        """Build the matplotlib plot area."""
        plot_frame = tk.Frame(parent, bg=BG_COLOR, relief=tk.SUNKEN, bd=2)
        plot_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create matplotlib figure
        self.fig = Figure(figsize=(10, 6), dpi=100, facecolor=BG_COLOR)
        self.ax = self.fig.add_subplot(111, facecolor=BG_COLOR)
        
        # Create canvas
        self.canvas = FigureCanvasTkAgg(self.fig, master=plot_frame)
        self.canvas.draw()
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # Add navigation toolbar
        toolbar = NavigationToolbar2Tk(self.canvas, plot_frame)
        toolbar.update()
        
        # Initialize plot
        self.setup_plot()

    def build_status_bar(self, parent):
        """Build the status bar."""
        status_frame = tk.Frame(parent, bg=PANEL_COLOR, relief=tk.SUNKEN, bd=1)
        status_frame.pack(fill=tk.X, pady=(10, 0))
        
        self.status_label = tk.Label(status_frame, text="Ready", bg=PANEL_COLOR, 
                                     fg=TEXT_COLOR, font=("Arial", 10), anchor="w")
        self.status_label.pack(side=tk.LEFT, padx=10, pady=5)
        
        self.signal_label = tk.Label(status_frame, text="● No Signal", bg=PANEL_COLOR,
                                    fg="#F44336", font=("Arial", 10, "bold"))
        self.signal_label.pack(side=tk.RIGHT, padx=10, pady=5)

    def setup_plot(self):
        """Setup the initial plot configuration."""
        self.ax.clear()
        self.ax.set_xlabel("Time (seconds)", fontsize=12, color=TEXT_COLOR)
        self.ax.set_ylabel("Resistance (MΩ)", fontsize=12, color=TEXT_COLOR)
        self.ax.set_title("Pocket Scion Real-time Data", fontsize=14, fontweight="bold", color=TEXT_COLOR)
        self.ax.grid(True, alpha=0.3, color=GRID_COLOR)
        self.ax.set_facecolor(BG_COLOR)
        self.ax.tick_params(colors=TEXT_COLOR)
        for spine in self.ax.spines.values():
            spine.set_edgecolor(TEXT_COLOR)
        
        if self.auto_scale.get():
            self.ax.autoscale(True)
        
        self.canvas.draw()

    def start_osc_receiver(self):
        """Start the OSC receiver."""
        self.osc_receiver = OSCReceiver(self.on_osc_sample)
        result = self.osc_receiver.start()
        if result is not True:
            messagebox.showerror("OSC Error", 
                               f"Could not start OSC receiver:\n{result}\n\n"
                               f"Make sure port {OSC_PORT} is not in use.")

    def on_osc_sample(self, timestamp, value, data_type='mean'):
        """Callback for OSC data samples."""
        if self.time_offset is None:
            self.time_offset = timestamp
        
        relative_time = timestamp - self.time_offset
        
        if data_type == 'mean':
            self.mean_data.append((relative_time, value))
        else:
            self.deviation_data.append((relative_time, value))

    def update_plot(self):
        """Update the plot with current data."""
        # Clear and redraw
        self.ax.clear()
        
        # Plot mean data if selected
        if self.show_mean.get() and self.mean_data:
            times, values = zip(*self.mean_data)
            self.ax.plot(times, values, color='#4CAF50', label='Mean', linewidth=2, alpha=0.9)
        
        # Plot deviation data if selected
        if self.show_deviation.get() and self.deviation_data:
            times, values = zip(*self.deviation_data)
            self.ax.plot(times, values, color='#FF9800', label='Deviation', linewidth=2, alpha=0.9)
        
        # Configure plot
        self.ax.set_xlabel("Time (seconds)", fontsize=12, color=TEXT_COLOR)
        self.ax.set_ylabel("Resistance (MΩ)", fontsize=12, color=TEXT_COLOR)
        self.ax.set_title("Pocket Scion Real-time Data", fontsize=14, fontweight="bold", color=TEXT_COLOR)
        self.ax.grid(True, alpha=0.3, color=GRID_COLOR)
        self.ax.set_facecolor(BG_COLOR)
        self.ax.tick_params(colors=TEXT_COLOR)
        for spine in self.ax.spines.values():
            spine.set_edgecolor(TEXT_COLOR)
        
        if self.show_mean.get() or self.show_deviation.get():
            self.ax.legend(loc='upper right')
        
        if self.auto_scale.get():
            self.ax.autoscale(True)
        
        self.canvas.draw()
        
        # Update status
        self.update_status()
        
        # Schedule next update
        self.root.after(1000, self.update_plot)

    def update_status(self):
        """Update the status bar."""
        # Update signal status
        if self.osc_receiver and self.osc_receiver.signal_ok:
            self.signal_label.config(text="● Signal OK", fg="#4CAF50")
            
            # Show latest values if available
            mean_count = len(self.mean_data)
            dev_count = len(self.deviation_data)
            
            if mean_count > 0:
                latest_mean = self.mean_data[-1][1]
                mean_text = f"Mean: {latest_mean:.3f} MΩ"
            else:
                mean_text = "Mean: No data"
            
            if dev_count > 0:
                latest_dev = self.deviation_data[-1][1]
                dev_text = f"Deviation: {latest_dev:.3f} MΩ"
            else:
                dev_text = "Deviation: No data"
            
            self.status_label.config(text=f"{mean_text} | {dev_text} | "
                                    f"Samples: {mean_count} mean, {dev_count} deviation")
        else:
            self.signal_label.config(text="● No Signal", fg="red")
            self.status_label.config(text="Waiting for OSC data...")

    def clear_data(self):
        """Clear all data."""
        self.mean_data.clear()
        self.deviation_data.clear()
        self.time_offset = None
        self.setup_plot()

    def save_plot(self):
        """Save the current plot as an image."""
        filename = filedialog.asksaveasfilename(
            defaultextension=".png",
            filetypes=[("PNG files", "*.png"), ("PDF files", "*.pdf"), 
                      ("SVG files", "*.svg"), ("All files", "*.*")],
            initialfile=f"scion_plot_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )
        
        if filename:
            try:
                self.fig.savefig(filename, dpi=300, bbox_inches='tight')
                messagebox.showinfo("Success", f"Plot saved to:\n{filename}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save plot:\n{str(e)}")

    def export_data(self):
        """Export data to JSON file."""
        filename = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialfile=f"scion_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )
        
        if filename:
            try:
                data = {
                    "timestamp": datetime.now().isoformat(),
                    "mean_data": list(self.mean_data),
                    "deviation_data": list(self.deviation_data),
                    "units": "Resistance (MΩ)",
                    "time_units": "seconds"
                }
                
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)
                
                messagebox.showinfo("Success", f"Data exported to:\n{filename}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to export data:\n{str(e)}")

    def on_closing(self):
        """Handle application closing."""
        if self.osc_receiver:
            self.osc_receiver.stop()
        self.root.destroy()


def main():
    """Main entry point."""
    root = tk.Tk()
    app = ScionPlotterApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
