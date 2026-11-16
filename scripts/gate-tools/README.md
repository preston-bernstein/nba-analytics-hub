# Gate tools

Tools that the pack gates in `scripts/` need in CI. Nothing here ships.

- `requirements.in` lists the pinned Python tools: ShellCheck, shfmt, actionlint, zizmor and hadolint.
- `requirements.txt` is the hash-locked list. Install it with `pip install --require-hashes -r requirements.txt`.
- `install-trivy.sh` downloads Trivy and checks its sha256, because Trivy has no PyPI package.
- `install-vale.sh` does the same for Vale, the prose linter that `scripts/writing-validate.sh` runs.

To change a version, edit `requirements.in` and run:

```bash
uv pip compile --generate-hashes --python-version 3.12 requirements.in -o requirements.txt
```
