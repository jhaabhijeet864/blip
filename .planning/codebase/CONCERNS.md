# Technical Debt, Concerns & Known Limitations

**Date:** 2026-10-29  
**Application:** Blip (`blip`)  

---

## 1. Virtual Camera Driver Dependencies

- **Issue:** Virtual camera output relies on OS-level drivers (OBS VirtualCam or DirectShow filters on Windows, `v4l2loopback` on Linux). If the user does not have OBS Studio or a virtual camera installed, video cannot stream to Google Meet.
- **Current Mitigation:** `check_virtual_camera_driver()` detects missing drivers and logs helpful installation instructions. In headless CI or development mode, the app runs with `vcam_sink = None` while maintaining GUI preview.
- **Long-Term Action:** Bundle a lightweight virtual camera installer or direct virtual driver installer during Windows MSI/InnoSetup packaging.

---

## 2. Frame Processing Latency & FPS Guarantees

- **Constraint:** Real-time video conferencing requires maintaining `>= 30 FPS` at `1280x720` resolution. Running MediaPipe Hands and Selfie Segmentation sequentially every frame can be computationally demanding on older CPUs without hardware AVX or GPU acceleration.
- **Current Mitigations:**
  - `SelfieSegmenter` utilizes `model_selection=1` (fast 256x144 landscape inference).
  - Background calibration uses numpy vectorized matrix averaging.
  - When in `DISAPPEARED` state, hand tracking and heavy segmentation are throttled or bypassed to conserve CPU resources until a reappearance gesture is detected.
- **Future Optimizations:**
  - Move particle rendering to an OpenGL shader or PyOpenCL kernel for 10,000+ particles.
  - Run MediaPipe Hands on every second frame (frame skipping with position interpolation).

---

## 3. Dynamic Room Lighting Changes

- **Constraint:** If room lighting changes significantly after initial background calibration (e.g. sunlight shifting or overhead lights turned off), the captured plate might look slightly mismatched with the surrounding shadows.
- **Current Mitigation:** `BackgroundManager.get_plate()` implements adaptive luminance ratio matching in LAB color space bounded between `[0.7, 1.3]`.
- **Recommendation:** Provide a one-click "Re-calibrate Background" button accessible via hotkey and UI.

---

## 4. Headless CI Environments

- **Constraint:** CI machines (GitHub Actions `ubuntu-latest` and `windows-latest`) lack physical webcams, physical displays (headless Linux), and sound hardware (`winsound`).
- **Current Mitigations:**
  - All test suites mock webcam feeds with synthetic numpy arrays.
  - Virtual camera tests mock `pyvirtualcam`.
  - UI components avoid blocking event loops during testing.
