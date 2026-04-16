import torch
import numpy as np
import json
from src.models import TranAD

print("🚀 Starting GOCE Inference System...")

# -----------------------------
# Load Model
# -----------------------------
model = TranAD(103)
model = model.double()

checkpoint = torch.load("checkpoints/TranAD_GOCE/model.ckpt", weights_only=False)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

print("✅ Model loaded")

# -----------------------------
# Load Data
# -----------------------------
data = np.load("output/GOCE/test.npy")
print("✅ Data loaded:", data.shape)

# -----------------------------
# Threshold
# -----------------------------
THRESHOLD = 38.66

# -----------------------------
# Storage
# -----------------------------
results = []

# -----------------------------
# MAIN LOOP
# -----------------------------
for i in range(len(data)):

    sample = data[i].copy()

    # -----------------------------
    # 🔥 STRONG anomaly every 25 samples
    # -----------------------------
    if i % 25 == 0:
        sample[0:60] += np.random.uniform(8, 15, size=60)

    # -----------------------------
    # Prepare input
    # -----------------------------
    x = torch.DoubleTensor(sample).unsqueeze(0).unsqueeze(0)

    # -----------------------------
    # Model inference
    # -----------------------------
    with torch.no_grad():
        output = model(x, x)

        if isinstance(output, tuple):
            output = output[1]

    # -----------------------------
    # Compute anomaly score
    # -----------------------------
    error = torch.mean((output - x) ** 2).item()

    status = "ANOMALY" if error > THRESHOLD else "NORMAL"

    # -----------------------------
    # Save result
    # -----------------------------
    results.append({
        "index": i,
        "score": error,
        "status": status
    })

# -----------------------------
# Save results
# -----------------------------
with open("ui/results.json", "w") as f:
    json.dump(results, f)

print("✅ results.json created successfully")

# -----------------------------
# Debug summary (optional)
# -----------------------------
anomaly_count = sum(1 for r in results if r["status"] == "ANOMALY")
print(f"🚨 Total anomalies detected: {anomaly_count}")