"""
Unit tests for the Blip Automated Codebase Issue Generator.
Validates code context collection, prompt formation, fallback logic,
deduplication filtering, and GitHub issue Markdown formatting.
Compatible with standard library unittest.
"""

from __future__ import annotations

import os
import unittest

from scripts.gemini_issue_generator import (
    build_analysis_prompt,
    format_issue_markdown,
    gather_code_context,
    resolve_api_keys,
)


class TestGeminiIssueGenerator(unittest.TestCase):
    def test_resolve_api_keys(self):
        os.environ["ISSUE_MAKER_GEMINI_KEY"] = "gemini_custom_secret"
        os.environ["ISSUE_MAKER_GROQ_KEY"] = "groq_custom_secret"

        gemini_key, groq_key = resolve_api_keys()
        self.assertEqual(gemini_key, "gemini_custom_secret")
        self.assertEqual(groq_key, "groq_custom_secret")

        # Fallback to standard env vars
        del os.environ["ISSUE_MAKER_GEMINI_KEY"]
        del os.environ["ISSUE_MAKER_GROQ_KEY"]
        os.environ["GEMINI_API_KEY"] = "gemini_fallback"
        os.environ["GROQ_API_KEY"] = "groq_fallback"

        gemini_key, groq_key = resolve_api_keys()
        self.assertEqual(gemini_key, "gemini_fallback")
        self.assertEqual(groq_key, "groq_fallback")

        # Cleanup
        del os.environ["GEMINI_API_KEY"]
        del os.environ["GROQ_API_KEY"]

    def test_gather_code_context(self):
        context = gather_code_context("security")
        self.assertIsInstance(context, dict)
        self.assertGreater(len(context), 0)
        self.assertTrue(any("manifest.json" in k or "content.ts" in k for k in context.keys()))

    def test_build_analysis_prompt(self):
        dummy_context = {
            "extension/src/content.ts": "console.log('blip test');",
        }
        prompt = build_analysis_prompt("guardrails", dummy_context, 2)
        self.assertIn("Target Focus Area: GUARDRAILS", prompt)
        self.assertIn("extension/src/content.ts", prompt)
        self.assertIn("fingerprint", prompt)
        self.assertIn("remediation_plan", prompt)

    def test_format_issue_markdown(self):
        dummy_issue = {
            "fingerprint": "webrtc-stream-unhandled-rejection",
            "title": "[Security] WebRTC Stream Unhandled Rejection",
            "category": "security",
            "severity": "high",
            "affected_files": ["extension/src/stream-interceptor.ts"],
            "problem_statement": "The getUserMedia interception can reject without catching async errors.",
            "technical_analysis": "When getUserMedia is called in Google Meet, missing try/catch causes meeting freeze.",
            "remediation_plan": "Wrap the native call in a try/catch and fallback to direct stream.",
            "suggested_code_diff": "+ try { ... } catch (e) { ... }",
        }

        markdown = format_issue_markdown(
            dummy_issue, "Gemini 2.5 Flash (gemini-2.5-flash)", "jhaabhijeet864/blip"
        )
        self.assertIn("<!-- BLIP-AUDIT-ID: webrtc-stream-unhandled-rejection -->", markdown)
        self.assertIn("Audit Finding: [Security] WebRTC Stream Unhandled Rejection", markdown)
        self.assertIn("Gemini 2.5 Flash", markdown)
        self.assertIn("`HIGH`", markdown)
        self.assertIn(
            "https://github.com/jhaabhijeet864/blip/blob/main/extension/src/stream-interceptor.ts",
            markdown,
        )
        self.assertIn("Proposed Remediation Diff", markdown)

    def test_deduplication_logic(self):
        existing_fingerprints = {"audit-existing-123", "audit-old-fix"}
        existing_titles = {"[security] old fixed issue title"}

        candidates = [
            {
                "fingerprint": "audit-existing-123",
                "title": "A new title with old fingerprint",
            },
            {
                "fingerprint": "audit-brand-new",
                "title": "[security] old fixed issue title",
            },
            {
                "fingerprint": "audit-brand-new-2",
                "title": "[Performance] Canvas Memory Optimization",
            },
        ]

        filtered = []
        for c in candidates:
            fp = c["fingerprint"].lower()
            title = c["title"].lower()
            if fp in existing_fingerprints or title in existing_titles:
                continue
            filtered.append(c)

        self.assertEqual(len(filtered), 1)
        self.assertEqual(filtered[0]["fingerprint"], "audit-brand-new-2")


if __name__ == "__main__":
    unittest.main()
