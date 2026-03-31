# 🤝 Contributing to Eternal Nagual

Thank you for your interest in contributing to Eternal Nagual!

## How to Contribute

### 1. Report Issues
- Open a GitHub Issue for bugs, feature requests, or questions
- Include your system info, error logs, and steps to reproduce

### 2. Add New Tools
Create a Python file in `/root/nagual/skills/dynamic/` or use the TrinityClawSkillCreator:
```python
# Your tool must be AST-valid Python
# Use @register_tool decorator
@register_tool("my_tool", "Description of what it does")
async def my_tool(arg1: str) -> str:
    return f"Result: {arg1}"
```

### 3. Add New LLM Providers
Edit `config.env` and add your provider in the UniversalLLMRouter PROVIDERS dict.

### 4. Improve Sacred Geometry
We're always looking for new mathematical patterns, especially:
- Fibonacci sequences in neural architectures
- PHI-based attention mechanisms
- Vector Equilibrium field applications

### 5. Code Standards
- All code in English (comments, variables, docstrings)
- PEP 8 compliant
- Type hints where practical
- Every module must have `get_stats()` method

### 6. Safety First
- NEVER modify AsimovSafetyFilter, PolicyEngine, or NagwalSandbox without review
- These are DGM-protected modules
- Safety is architectural, not optional

## Contact
- Konstantin: [@Nebulyai](https://t.me/Nebulyai) on Telegram
- GitHub: [Arhitect-Nagual-Agent](https://github.com/Arhitect-Nagual-Agent)
