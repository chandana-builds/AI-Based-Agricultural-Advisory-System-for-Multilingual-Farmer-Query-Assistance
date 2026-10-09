import os
import sys

# Ensure backend directory is in sys.path and set as working directory
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agri-advisory-system", "backend")
if os.path.exists(backend_dir):
    sys.path.insert(0, backend_dir)
    os.chdir(backend_dir)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
