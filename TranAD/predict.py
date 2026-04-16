import numpy as np
from datetime import datetime

print("      GOCE Satellite Telemetry Analyzer")

THRESHOLD = 38.66


value = float(input("Enter telemetry value: "))


anomaly_score = abs(value)

print("\n----------- TELEMETRY ANALYSIS -----------")
print("Timestamp        :", datetime.now())
print("Input Telemetry  :", value)
print("Anomaly Score    :", anomaly_score)
print("Model Threshold  :", THRESHOLD)

print("\n----------- DECISION ENGINE --------------")

if anomaly_score > THRESHOLD:
    print("Status           : ANOMALY DETECTED")
    print("Transmission     : REQUIRED")
    print("Reason           : Telemetry deviates from normal satellite behaviour")
else:
    print("Status           : NORMAL")
    print("Transmission     : NOT REQUIRED")
    print("Reason           : Telemetry within learned operational limits")

print("\n----------- SYSTEM ACTION ----------------")

if anomaly_score > THRESHOLD:
    print("Action           : Send telemetry packet to ground station")
    print("Priority         : HIGH")
else:
    print("Action           : Ignore / Do not transmit")
    print("Priority         : LOW")

print("\n==========================================\n")
