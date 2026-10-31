"""
Unit tests for the Gemini High-Level Architectural PR Review Agent.
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from scripts.gemini_pr_reviewer import (
    STICKY_HEADER,
    build_review_payload,
    build_system_prompt,
    call_gemini_api,
    format_full_comment,
    generate_mock_review,
    main,
)


def test_build_system_prompt():
    """Verify system prompt includes architectural and real-time focus."""
    prompt = build_system_prompt()
    assert "Blip Principal Architecture" in prompt
    assert "30 FPS" in prompt
    assert "Latency Budget" in prompt
    assert "Device Safety" in prompt
    assert "CodeRabbit" in prompt


def test_build_review_payload():
    """Verify payload formatting and large diff truncation."""
    short_payload = build_review_payload(
        pr_title="feat(camera): add dynamic hot-swapping",
        pr_body="Enables hot-swapping cameras without restart.",
        pr_author="test-user",
        diff_stat="1 file changed, 10 insertions(+)",
        diff_text="+pub fn hot_swap() {}",
        head_sha="abcdef1234567890",
    )
    assert "feat(camera): add dynamic hot-swapping" in short_payload
    assert "@test-user" in short_payload
    assert "abcdef1234567890" in short_payload

    # Test truncation on huge diff
    huge_diff = "A" * 90000
    truncated_payload = build_review_payload(
        pr_title="huge change",
        pr_body="",
        pr_author="dev",
        diff_stat="many files",
        diff_text=huge_diff,
        head_sha="123",
    )
    assert "[Diff truncated:" in truncated_payload


def test_generate_mock_review():
    """Verify dry-run mock review generation."""
    review = generate_mock_review(
        pr_title="feat(ui): add safety switch",
        pr_author="author",
        head_sha="fedcba9876543210",
        diff_stat="2 files changed",
    )
    assert "### 🚦 Executive Verdict" in review
    assert "APPROVED" in review
    assert "Strategic Architecture Scorecard" in review
    assert "fedcba9" in review


def test_format_full_comment():
    """Verify comment structure and sticky marker."""
    body = "### 🚦 Executive Verdict\n**`APPROVED`**"
    comment = format_full_comment(
        review_body=body,
        pr_number="42",
        head_sha="1234567890abcdef",
        model="gemini-3.8-flash",
    )
    assert comment.startswith(STICKY_HEADER)
    assert "PR #42" in comment
    assert "1234567" in comment
    assert "## 🤖 Blip Architectural Review Agent" in comment
    assert "gemini-3.8-flash" not in comment


def test_main_dry_run_file_output(tmp_path: Path):
    """Verify CLI dry run writes formatted markdown to target path."""
    out_file = tmp_path / "pr_review.md"
    exit_code = main(
        [
            "--pr-number",
            "99",
            "--pr-title",
            "refactor(core): optimize frame pipeline",
            "--pr-author",
            "contributor",
            "--head-sha",
            "9876543210abcdef",
            "--output",
            str(out_file),
            "--dry-run",
        ]
    )
    assert exit_code == 0
    assert out_file.exists()
    content = out_file.read_text(encoding="utf-8")
    assert STICKY_HEADER in content
    assert "PR #99" in content
    assert "9876543" in content


def test_call_gemini_api_urllib_fallback():
    """Verify REST API parsing using mock urllib response."""
    mock_response = MagicMock()
    mock_response.read.return_value = b'{"candidates": [{"content": {"parts": [{"text": "### \\ud83d\\udea6 Executive Verdict\\n**APPROVED**"}]}}]}'
    mock_response.__enter__.return_value = mock_response

    with patch("urllib.request.urlopen", return_value=mock_response):
        res = call_gemini_api(
            prompt="review this",
            system_instruction="system prompt",
            api_key="fake-test-key",
            model="gemini-3.8-flash",
        )
        assert "APPROVED" in res
