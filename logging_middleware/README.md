# Logging Middleware

## Setup
```bash
pip install requests
```

Edit `config.py` and fill in your CLIENT_ID, CLIENT_SECRET, EMAIL, NAME, ROLL_NO, ACCESS_CODE.

## Usage
```python
from logger import Log

Log("backend", "info",  "route",   "GET /notifications received")
Log("backend", "error", "handler", "received string, expected bool")
Log("backend", "fatal", "db",      "Critical database connection failure.")
```
