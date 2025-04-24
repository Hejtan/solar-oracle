import pickle
import pandas as pd
from datetime import datetime, timedelta
import requests

# Load the model
with open('model.pkl', 'rb') as f:
    loaded_model = pickle.load(f)

# Load the scaler
with open('scaler.pkl', 'rb') as f:
    loaded_scaler = pickle.load(f)

def fetch_openmeteo_data(month, year, latitude, longitude):

    # Construct the start and end dates for the chosen month
    start_date = datetime(year, month, 1).strftime('%Y-%m-%d')
    if month == 12:
        end_date = (datetime(year + 1, 1, 1) - timedelta(days=1)).strftime('%Y-%m-%d')
    else:
        end_date = (datetime(year, month + 1, 1) - timedelta(days=1)).strftime('%Y-%m-%d')

    # Define API URL for historical data
    url = "https://archive-api.open-meteo.com/v1/archive"

    # Define parameters
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": [
            "temperature_2m",
            "precipitation",
            "wind_speed_10m",
            "shortwave_radiation",
            "direct_radiation",
            "diffuse_radiation",
            "sunshine_duration"
        ],
        "timezone": "Europe/Warsaw",
    }

    # Make API request
    response = requests.get(url, params=params)
    data = response.json()

    # Convert to DataFrame
    df = pd.DataFrame(data["hourly"])
    df["time"] = pd.to_datetime(df["time"])  # Convert time column to datetime

    # Filter to whole hours only (if needed)
    df = df[df["time"].dt.minute == 0]

    return df

def get_energy(energy_consumed_per_month_in_kwh, solar_power_in_kw, month, year, latitude, longitude):

    weather_data = fetch_openmeteo_data(month=month, year=year, latitude=latitude, longitude=longitude)

    data = {
        "Hour": []
    }

    for index, x in weather_data.iterrows():
        data["Hour"].append(index % 24)
    
    data["temperature_2m"] = list(weather_data["temperature_2m"])
    data["precipitation"] = list(weather_data["precipitation"])
    data["wind_speed_10m"] = list(weather_data["wind_speed_10m"])
    data["shortwave_radiation"] = list(weather_data["shortwave_radiation"])
    data["direct_radiation"] = list(weather_data["direct_radiation"])
    data["diffuse_radiation"] = list(weather_data["diffuse_radiation"])
    data["sunshine_duration"] = list(weather_data["sunshine_duration"])

    df = pd.DataFrame(data)

    X = loaded_scaler.transform(df)

    # Use the loaded model
    predicted_production = loaded_model.predict(X)
    predicted_production = list(predicted_production)
    predicted_production = [float(x) for x in predicted_production]
    predicted_production = [0.0 if x < 0.0 else solar_power_in_kw / 15.21 * x for x in predicted_production]
    # 15,21 is solar panels power

    # Return predicted values
    return({"Predicted energy production": predicted_production})

"""
How does it work:

    Call function get_energy(), ensuring that you cannot give current month and any future date


example:
    get_energy(energy_consumed_per_month_in_kwh=2000, solar_power_in_kw=2, month=3, year=2023, 
                 latitude=51.1079, longitude=17.0385)

"""