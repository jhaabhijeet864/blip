"""
Design system and theme tokens for Blip Google Meet desktop UI.
Provides unified dark and light color tokens, layout radiuses, and fonts.
"""

from __future__ import annotations


class Theme:
    # ==========================================
    # Surface & Window Tokens (Light, Dark)
    # ==========================================
    WINDOW_BG = ("#f8fafc", "#09090b")
    STAGE_BG = ("#f1f5f9", "#111114")
    STAGE_BORDER = ("#e2e8f0", "#222228")
    CANVAS_BG = ("#e2e8f0", "#18181b")

    CARD_BG = ("#ffffff", "#16161a")
    CARD_BORDER = ("#e2e8f0", "#26262e")

    DOCK_BG = ("#ffffff", "#1a1a20")
    DOCK_BORDER = ("#cbd5e1", "#2e2e38")
    CHIP_BG = ("#e2e8f0", "#202026")
    CHIP_BORDER = ("#cbd5e1", "#2d2d36")

    # ==========================================
    # Typography Tokens (Light, Dark)
    # ==========================================
    TEXT_PRIMARY = ("#0f172a", "#f4f4f5")
    TEXT_MUTED = ("#64748b", "#a1a1aa")
    TEXT_FAINT = ("#94a3b8", "#71717a")

    # ==========================================
    # Status & Feedback Accents
    # ==========================================
    STATUS_LIVE = "#10b981"  # Emerald
    STATUS_CALIBRATING = "#3b82f6"  # Blue
    STATUS_VANISHED = "#a855f7"  # Purple
    STATUS_REAPPEARING = "#f59e0b"  # Amber

    # ==========================================
    # Action Pill Buttons (Light, Dark)
    # ==========================================
    BTN_CALIBRATE = ("#e2e8f0", "#26262e")
    BTN_CALIBRATE_HOVER = ("#cbd5e1", "#363642")
    BTN_CALIBRATE_TEXT = ("#0f172a", "#f4f4f5")

    BTN_SNAP = ("#8b5cf6", "#7c3aed")
    BTN_SNAP_HOVER = ("#7c3aed", "#6d28d9")

    BTN_GOKU = ("#f97316", "#ea580c")
    BTN_GOKU_HOVER = ("#ea580c", "#c2410c")

    BTN_REAPPEAR = ("#10b981", "#059669")
    BTN_REAPPEAR_HOVER = ("#059669", "#047857")

    BTN_SECONDARY = ("#f1f5f9", "#202028")
    BTN_SECONDARY_HOVER = ("#e2e8f0", "#2d2d38")

    # ==========================================
    # Controls (Light, Dark)
    # ==========================================
    COMBO_BG = ("#f1f5f9", "#202026")
    COMBO_BORDER = ("#cbd5e1", "#2e2e38")

    # ==========================================
    # Layout Metrics
    # ==========================================
    RADIUS_STAGE = 16
    RADIUS_CARD = 12
    RADIUS_DOCK = 24
    RADIUS_CHIP = 8
    RADIUS_BTN = 10
    RADIUS_INPUT = 8

    FONT_FAMILY = "Segoe UI"
