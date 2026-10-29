# Security Policy

## Zero-Telemetry & Camera Privacy Guarantee

**Blip is built with a strict local-first privacy architecture:**
- **100% Offline Processing:** All video frames captured from your webcam are processed in-memory using local Python/C++ binaries (OpenCV and MediaPipe).
- **Zero Cloud Transmission:** Blip does NOT transmit, stream, record, or upload video frames, audio, or metadata to any external server or cloud service.
- **No Analytics / Telemetry:** No tracking, usage analytics, or remote logging libraries are bundled or executed.
- **Local Plate Storage:** Background calibration frames reside strictly in your local volatile RAM while the application is active and are discarded upon shutdown.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## Reporting a Vulnerability

If you discover a security vulnerability or privilege issue within Blip, please do **NOT** open a public issue.

Please report the issue directly via email to:
📧 **jhaabhijeet864@gmail.com**

Include the following details in your report:
- Type of issue (e.g., buffer overflow, insecure dependency, driver privilege escalation)
- Steps to reproduce
- Affected OS and Python environment
- Any proof of concept (PoC) code or logs

You should expect an acknowledgment within 48 hours. Validated vulnerabilities will be remediated in a security patch release as quickly as possible.
