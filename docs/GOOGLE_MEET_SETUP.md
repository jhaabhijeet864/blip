# Video Conferencing Integration Guide

This guide provides instructions for connecting Blip's virtual camera feed to Google Meet, Zoom, Microsoft Teams, and Discord across Windows, Linux, and macOS.

---

## Understanding Video Routing

Blip separates the **video input source** from the **meeting output device**:

1. **Input Camera (Configured in Blip):**
   - The physical camera capturing your real face (e.g., `HP Wide Vision HD Camera`, `Logitech HD Pro Webcam`).
   - Phone camera apps (like `DroidCam` or `Iriun`) will show up with their friendly names and can be selected if you are streaming from your phone, but Blip will prioritize your genuine physical laptop webcam by default.
2. **Output Virtual Camera Sink (Selected in Google Meet / Zoom):**
   - The virtual device where Blip broadcasts your processed feed.
   - When you snap or vanish, Blip swaps your live silhouette for the empty room and pushes that stream directly into the virtual camera.
   - You **do not** need to launch OBS Studio or keep it running. The virtual camera driver runs invisibly in the Windows background.

---

## Google Meet

1. Launch **Blip** on your desktop (`python -m blip`).
2. Verify your physical camera (e.g., `HP Wide Vision HD Camera`) is selected in **Section 4: Hardware & Audio**.
3. In the Blip window, click **Calibrate Background** and step out of camera view for 3 seconds.
4. Open [meet.google.com](https://meet.google.com) in any modern browser (Chrome, Edge, Brave, Firefox).
5. Click **More Options** (vertical three dots in meeting controls) > **Settings**.
6. Select the **Video** tab on the left.
7. Under **Camera**, select **OBS Virtual Camera**.
8. Close Settings and snap your fingers or tap your temple during your call to vanish into dust or teleport away!

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
- **Alternative Backends:** Unity Virtual Camera or Windows Virtual Camera drivers.
- **Phone Cam Bridges:** If you have DroidCam installed, Blip displays it as `DroidCam Video (Offline)` when your phone is disconnected and automatically defaults to your laptop's integrated camera (`HP Wide Vision HD Camera`). If you wish to switch back to DroidCam, simply select it from the dropdown once your phone is connected.
