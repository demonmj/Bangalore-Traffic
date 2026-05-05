from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import random

app = FastAPI(title="Smart Traffic ML Service")

class TrafficUpdate(BaseModel):
    road_id: int
    road_name: str
    latitude: float
    longitude: float
    vehicle_count: int
    avg_speed: float
    congestion_level: float

class OptimizationRequest(BaseModel):
    data: List[TrafficUpdate]

@app.get("/api/status")
def read_root():
    return {"status": "ML Service is running", "models": ["LSTM Forecasting", "XGBoost Signal Optimizer"]}

@app.post("/optimize/signals")
def optimize_signals(request: OptimizationRequest):
    """
    Mock XGBoost Signal Optimizer that also mocks LSTM route prediction.
    In a real scenario, this runs inference on the actual trained files.
    """
    predictions = []
    for item in request.data:
        # Pseudo LSTM output for 15, 30, 60 min forecasts (random walk based on current congestion)
        forecast_15 = max(0, min(10, item.congestion_level + random.uniform(-1, 1)))
        forecast_30 = max(0, min(10, forecast_15 + random.uniform(-1.5, 1.5)))
        forecast_60 = max(0, min(10, forecast_30 + random.uniform(-2, 2)))
        
        predictions.append({
            "road_id": item.road_id,
            "predictions_15m": round(forecast_15, 2),
            "predictions_30m": round(forecast_30, 2),
            "predictions_60m": round(forecast_60, 2),
            "suggested_green_time": int(max(15, min(90, 30 + (item.congestion_level * 5))))
        })
    
    return {"status": "optimized", "results": predictions}

@app.get("/predict/route-load")
def predict_route_load():
    """ Mock Scikit-Learn Route Load prediction """
    return {
        "busiest_routes_prob": [
            {"road_id": 1, "probability": 0.85},
            {"road_id": 8, "probability": 0.72},
            {"road_id": 15, "probability": 0.65}
        ]
    }
