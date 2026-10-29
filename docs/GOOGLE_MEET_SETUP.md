# Video Conferencing Integration Guide

This guide provides instructions for connecting Blip's virtual camera feed to Google Meet, Zoom, Microsoft Teams, and Discord across Windows, Linux, and macOS.

---

## Google Meet

1. Launch **Blip** on your desktop.
2. In the Blip window, click **Calibrate Background** and step out of camera view for 3 seconds.
3. Open [meet.google.com](https://meet.google.com) in any modern browser (Chrome, Edge, Brave, Firefox).
4. Click **More Options** (vertical three dots in meeting controls) > **Settings**.
5. Select the **Video** tab on the left.
6. Under **Camera**, select **OBS Virtual Camera** (or the active virtual camera device).
7. Close Settings and snap your fingers or tap your temple during your call.

---

## Zoom (Desktop Client)

1. Launch Blip and complete background calibration.
2. Open Zoom and click the **Settings** gear in the upper right.
3. Navigate to **Video**.
4. In the **Camera** dropdown, select **OBS Virtual Camera**.
5. Ensure *Original ratio* or *16:9* is selected.

---

## Microsoft Teams

1. In Teams, click your profile icon or the three dots > **Settings**.
2. Select **Devices**.
3. Under **Video settings** > **Camera**, select **OBS Virtual Camera**.
4. Verify the preview window displays your Blip video stream.

---

## Discord

1. Open **User Settings** (gear icon) > **Voice & Video**.
2. Scroll to **Video Settings**.
3. In the **Camera** dropdown, select **OBS Virtual Camera**.
4. Click **Test Video** to confirm detection.

---

## Operating System Driver Setup & Troubleshooting

### Windows
- **Recommended Backend:** [OBS Studio](https://obsproject.com/). Installing OBS automatically registers the OBS Virtual Camera DirectShow driver.
- **Manual Driver Registration:** If OBS is installed but the camera does not show in browser settings, run PowerShell as Administrator:
  ```powershell
  cd "C:\Program Files\obs-studio\data\obs-plugins\win-dshow"
  .\virtualcam-install.bat
  ```

### Linux
- **Kernel Module:** Requires `v4l2loopback`.
  ```bash
  sudo apt-get install v4l2loopback-dkms v4l2loopback-utils
  sudo modprobe v4l2loopback devices=1 video_nr=10 card_label="Blip Virtual Cam" exclusive_caps=1
  ```

### macOS
- **DAL Plugin:** Install the OBS VirtualCam plugin:
  ```bash
  brew install --cask obs
  ```
  Launch OBS once to authorize the virtual camera plugin in System Settings > Privacy & Security.

