from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from energy_prediction import get_energy

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def echo(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse(content={"error": "Invalid JSON"}, status_code=400)
    print(data)

    month = data["month"] 
    year = data["year"]
    energy_usage = data["energy_usage"]
    income_per_kwh = data["income_per_kwh"]
    cost_per_kwh = data["cost_per_kwh"]
    transfer_cost = data["transfer_cost"]
    latitude = data["latitude"]
    longitude = data["longitude"]
    power = data["power"]

    response = get_energy(energy_usage, power, month, year, latitude, longitude)
    response["year"] = year
    response["month"] = month
    return JSONResponse(content=response, status_code=200)

if __name__ == '__main__':
    uvicorn.run("server:app", host="0.0.0.0", port=5000, reload=True)