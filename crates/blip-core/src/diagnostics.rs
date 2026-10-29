//! Diagnostic canvas rendering for offline or disconnected camera states.

use image::{Rgb, RgbImage};

/// Generates a synthetic diagnostic preview frame when a camera or driver is offline.
pub fn render_offline_frame(
    width: u32,
    height: u32,
    camera_name: &str,
    reason: &str,
) -> RgbImage {
    let mut img = RgbImage::new(width, height);

    // Deep dark slate background (#13151A)
    let bg_color = Rgb([19, 21, 26]);
    for pixel in img.pixels_mut() {
        *pixel = bg_color;
    }

    // Top warning accent strip (#EF4444)
    let strip_h = (height / 80).max(4);
    let accent_color = Rgb([239, 68, 68]);
    for y in 0..strip_h {
        for x in 0..width {
            img.put_pixel(x, y, accent_color);
        }
    }

    // Centered card background (#1E222B)
    let card_w = (width as f32 * 0.7) as u32;
    let card_h = (height as f32 * 0.45) as u32;
    let start_x = (width - card_w) / 2;
    let start_y = (height - card_h) / 2;

    let card_color = Rgb([30, 34, 43]);
    let border_color = Rgb([45, 52, 66]);

    for y in start_y..(start_y + card_h) {
        for x in start_x..(start_x + card_w) {
            if x == start_x || x == start_x + card_w - 1 || y == start_y || y == start_y + card_h - 1 {
                img.put_pixel(x, y, border_color);
            } else {
                img.put_pixel(x, y, card_color);
            }
        }
    }

    // Status indicator dot inside card
    let dot_center_x = start_x + 30;
    let dot_center_y = start_y + 30;
    let dot_radius = 8;
    for dy in -dot_radius..=dot_radius {
        for dx in -dot_radius..=dot_radius {
            if dx * dx + dy * dy <= dot_radius * dot_radius {
                let px = (dot_center_x as i32 + dx) as u32;
                let py = (dot_center_y as i32 + dy) as u32;
                if px < width && py < height {
                    img.put_pixel(px, py, accent_color);
                }
            }
        }
    }

    // Subtly stamp corner resolution indicator
    let badge_color = Rgb([75, 85, 99]);
    let footer_y = height - 12;
    for x in (width.saturating_sub(60))..width.saturating_sub(10) {
        if x < width && footer_y < height {
            img.put_pixel(x, footer_y, badge_color);
        }
    }

    let _ = (camera_name, reason); // Included for formatting log metadata
    img
}

