import numpy as np
import os

# Load processed GOCE data
data = np.load("../processed/goce_eps_mean.npy")

T, F = data.shape
print("Data shape:", data.shape)

# Train / Test split (70% / 30%)
split = int(0.7 * T)
train = data[:split]
test = data[split:]

# Dummy labels (unsupervised)
labels = np.zeros_like(test)

# Save to TranAD expected location
out_dir = "../TranAD/output/GOCE"
os.makedirs(out_dir, exist_ok=True)

np.save(f"{out_dir}/train.npy", train)
np.save(f"{out_dir}/test.npy", test)
np.save(f"{out_dir}/labels.npy", labels)

print("GOCE dataset prepared for TranAD")
