#!/usr/bin/env python3
"""
Build script for Pocket Scion Data Plotter macOS executable
"""

import os
import subprocess
import sys
import glob

def main():
    print("Building Pocket Scion Experiment 1 executable...")
    
    # Ensure we're in the venv
    if not os.path.exists(".venv"):
        print("Error: .venv directory not found")
        return 1
    
    # Find the correct Python version directory
    python_dirs = glob.glob(".venv/lib/python*")
    if not python_dirs:
        print("Error: Could not find Python directory in .venv")
        return 1
    
    python_dir = python_dirs[0].split('/')[-1]  # Get just the directory name
    matplotlib_path = f".venv/lib/{python_dir}/site-packages/matplotlib/mpl-data"
    
    if not os.path.exists(matplotlib_path):
        print(f"Error: matplotlib data not found at {matplotlib_path}")
        return 1
    
    # Build the command as a single string to handle quotes properly
    app_name = "Pocket Scion Data Plotter"
    
    # PyInstaller command for macOS app bundle (fast onedir mode)
    if os.path.exists("icon.icns"):
        cmd_str = f'source .venv/bin/activate && pyinstaller --windowed --name="{app_name}" --icon=icon.icns --add-data="{matplotlib_path}:matplotlib/mpl-data" pocket_scion_data_plotter.py'
    else:
        cmd_str = f'source .venv/bin/activate && pyinstaller --windowed --name="{app_name}" --add-data="{matplotlib_path}:matplotlib/mpl-data" pocket_scion_data_plotter.py'
    
    print("Running command:", cmd_str)
    
    try:
        # Run the command properly with shell=True
        result = subprocess.run(cmd_str, shell=True, check=True, capture_output=True, text=True)
        print("Build successful!")
        print("Executable created in: dist/Pocket Scion Data Plotter.app")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"Build failed: {e}")
        print(f"Error output: {e.stderr}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
