import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import StandardScaler

# -----------------------
# CONFIG
# -----------------------
RAW_DIR = "../raw"
META_FILE = "../metadata.csv"
OUT_FILE = "../processed/goce_eps_mean.npy"

SUBSYSTEM = "EPS"
MAX_NAN_FRAC = 0.05
STAT_COLUMN = "value_mean"   # <-- IMPORTANT

# -----------------------
# LOAD METADATA
# -----------------------
meta = pd.read_csv(META_FILE, sep="\t")

eps_sensors = meta[
    (meta["subsystem"] == SUBSYSTEM) &
    (meta["nan_fraction"] <= MAX_NAN_FRAC)
]["param_name"].tolist()

print(f"Using {len(eps_sensors)} EPS sensors")

# -----------------------
# LOAD & ALIGN SENSOR FILES
# -----------------------
sensor_dfs = []

for sensor in eps_sensors:
    sensor_dir = os.path.join(RAW_DIR, sensor)
    if not os.path.isdir(sensor_dir):
        continue

    for f in os.listdir(sensor_dir):
        if f.endswith(".parquet"):
            path = os.path.join(sensor_dir, f)
            df = pd.read_parquet(path)

            if STAT_COLUMN not in df.columns:
                continue

            df = df[[STAT_COLUMN]].rename(columns={STAT_COLUMN: sensor})
            sensor_dfs.append(df)
            break  # one parquet per sensor is enough

# -----------------------
# MERGE ALL SENSORS ON TIME
# -----------------------
data = pd.concat(sensor_dfs, axis=1)

print("Shape before cleaning:", data.shape)

# Drop rows with missing values
data = data.dropna()

print("Shape after cleaning:", data.shape)

# -----------------------
# NORMALIZE
# -----------------------
scaler = StandardScaler()
data_scaled = scaler.fit_transform(data.values)

# -----------------------
# SAVE
# -----------------------
np.save(OUT_FILE, data_scaled)
print(f"Saved processed data to {OUT_FILE}")
