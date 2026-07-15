"""Smoke tests — the guarantees the README makes, verified mechanically.

Run: pip install pytest && pytest tests/ -v
No heavy dependencies required: units are extracted from core.py by AST,
never by importing the monolith.
"""
import ast
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Tuple

from conftest import CORE, CORE_SRC, ROOT, load_method, load_toplevel


# ── 1. The watchdog's own invariant: core.py always parses ──
def test_core_parses_as_valid_python():
    ast.parse(CORE_SRC)  # same check entrypoint.sh runs before boot


# ── 2. SOUL.md exists and is substantial (identity anchor) ──
def test_soul_identity_anchor_present():
    soul = ROOT / "data" / "dna" / "SOUL.md"
    assert soul.exists(), "SOUL.md identity anchor missing"
    assert len(soul.read_text(encoding="utf-8")) > 1000


# ── 3. Atomic writes survive interruption (no truncated JSON state) ──
def test_atomic_write_text(tmp_path):
    fn = load_toplevel("_atomic_write_text", {"Path": Path, "os": os})
    target = tmp_path / "state.json"
    fn(target, '{"ok": true}')
    assert target.read_text(encoding="utf-8") == '{"ok": true}'
    assert not (tmp_path / "state.json.tmp").exists(), "tmp file must be replaced, not left behind"


# ── 4. Asimov filter blocks known-bad, passes benign, no substring traps ──
def _asimov():
    ns = {"UNCHAINED": False, "re": re, "datetime": datetime, "Tuple": Tuple}
    cls = load_toplevel("AsimovSafetyFilter", ns)
    return cls()

def test_asimov_blocks_known_bad():
    safe, report = _asimov().check_safety("explain how to make bomb at home")
    assert not safe
    assert report["violations"]

def test_asimov_passes_benign():
    safe, _ = _asimov().check_safety("summarize today's research notes and forge a parsing skill")
    assert safe

def test_asimov_no_substring_false_positive():
    # 'kill' inside 'skill' must not raise harm score (word-boundary fix)
    safe, report = _asimov().check_safety("improve the run_skill pipeline for skill creation")
    assert safe, f"substring trap: {report}"


# ── 5. Think-stripper removes reasoning leakage from model output ──
def _stripper():
    return load_method("UniversalLLMRouter", "_strip_think_tags", {"re": re})

def test_strips_think_tags():
    out = _stripper()(None, "<think>secret chain of thought</think>The answer is 4.")
    assert "<think>" not in out and "chain of thought" not in out
    assert "The answer is 4." in out

def test_strips_special_tokens():
    out = _stripper()(None, "<|channel|>final<|message|>Hello there")
    assert "<|" not in out

def test_strips_bare_reasoning_preamble():
    out = _stripper()(None, "The user says hello and wants a greeting.\n\nHello! Great to see you.")
    assert out.startswith("Hello!")


# ── 6. Intent sanity gate: crash strings can never become intent ──
def _intent_sane():
    ns = {"re": re}
    load_toplevel("_INTENT_POISON", ns)
    return load_toplevel("_intent_sane", ns)

def test_intent_rejects_crash_strings():
    fn = _intent_sane()
    assert not fn("")
    assert not fn("All LLM slots failed (32 tried)")
    assert not fn("<placeholder> template echo")

def test_intent_accepts_real_intent():
    assert _intent_sane()("study the router cascade and forge a retry skill")


# ── 7. entrypoint.sh really is an AST watchdog with rollback ──
def test_entrypoint_watchdog_present():
    text = (ROOT / "entrypoint.sh").read_text(encoding="utf-8")
    assert "ast.parse" in text, "AST validation missing from entrypoint"
    assert "core_lastgood.py" in text, "rollback-to-last-good missing from entrypoint"


# ── 8. No secret-shaped material anywhere in the tracked tree ──
SECRET_PATTERNS = {
    "nvidia_key":   r"nvapi-[A-Za-z0-9_\-]{8,}",
    "google_key":   r"AIza[A-Za-z0-9_\-]{30,}",
    "github_token": r"gh[pousr]_[A-Za-z0-9]{30,}",
    "openrouter":   r"sk-or-v1-[a-z0-9]{16,}",
    "tg_bot_token": r"\b\d{8,10}:[A-Za-z0-9_\-]{30,}",
    "jwt":          r"eyJhbGciOi[A-Za-z0-9_\-\.]{20,}",
}

def test_no_secrets_in_tracked_files():
    files = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True,
                           text=True, check=False).stdout.splitlines()
    if not files:  # not a git checkout (tarball) — scan the obvious files
        files = ["core.py", "entrypoint.sh", "deploy.sh", "README.md", "config.env.example"]
    hits = []
    for rel in files:
        p = ROOT / rel
        if not p.is_file() or p.suffix in {".png", ".jpg", ".gif", ".ico", ".woff2"}:
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for name, pat in SECRET_PATTERNS.items():
            for m in re.finditer(pat, text):
                hits.append(f"{rel}: {name}: {m.group(0)[:24]}…")
    assert not hits, "secret-shaped strings found:\n" + "\n".join(hits)


# ── 9. Minimal install really is minimal ──
def test_requirements_minimal():
    reqs = [l.strip() for l in (ROOT / "requirements.txt").read_text(encoding="utf-8").splitlines()
            if l.strip() and not l.strip().startswith("#")]
    assert len(reqs) <= 10, f"minimal install grew heavy: {reqs}"
    joined = " ".join(reqs).lower()
    for heavy in ("torch", "faiss", "chromadb", "sentence-transformers"):
        assert heavy not in joined, f"{heavy} belongs in requirements-optional.txt"
