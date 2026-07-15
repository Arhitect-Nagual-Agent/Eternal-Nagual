"""Test helpers for the core.py monolith.

core.py is a single 15k-line file with module-level initialization, so the
smoke tests never import it. Instead they parse it once and surgically
extract the unit under test (a top-level function/class, a class method, or
a module constant) and exec just that source in a controlled namespace.
"""
import ast
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "core.py"
CORE_SRC = CORE.read_text(encoding="utf-8")
CORE_TREE = ast.parse(CORE_SRC)


def load_toplevel(name: str, namespace: dict):
    """Exec a top-level def/class/assignment by name into namespace."""
    for node in CORE_TREE.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) \
                and node.name == name:
            exec(compile(ast.get_source_segment(CORE_SRC, node), str(CORE), "exec"), namespace)
            return namespace[name]
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == name:
                    exec(compile(ast.get_source_segment(CORE_SRC, node), str(CORE), "exec"), namespace)
                    return namespace[name]
    raise KeyError(f"{name} not found at top level of core.py")


def load_method(cls_name: str, method: str, namespace: dict):
    """Exec a single method of a class as a standalone function."""
    for node in CORE_TREE.body:
        if isinstance(node, ast.ClassDef) and node.name == cls_name:
            for sub in node.body:
                if isinstance(sub, ast.FunctionDef) and sub.name == method:
                    src = textwrap.dedent(ast.get_source_segment(CORE_SRC, sub))
                    exec(compile(src, str(CORE), "exec"), namespace)
                    return namespace[method]
    raise KeyError(f"{cls_name}.{method} not found in core.py")
