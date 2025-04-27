import pandas as pd
import json

def predict(month_number: int, month_energy: float, model_path: str = 'consumption_model.json') -> dict:
    """
    Given a month number and its energy consumption, predict the minutely energy consumption over a year.

    Args:
        month_number (int): Month number (1-12)
        month_energy (float): Energy consumption for that month
        model_path (str): Path to the fractions model JSON file.

    Returns:
        dict: Mapping from 'MM-DD HH:MM' to predicted minutely energy
    """
    with open(model_path, 'r') as f:
        model_data = json.load(f)

    monthly_fraction = model_data['monthly_fraction']
    minute_fraction = model_data['minute_fraction']
    if str(month_number) not in monthly_fraction:
        raise ValueError(f"Month {month_number} is not found in model.")

    month_frac = monthly_fraction[str(month_number)]
    estimated_yearly_total = month_energy / month_frac

    # Estimate minutely values
    minutely_prediction = {}
    for minute_key, frac in minute_fraction.items():
        minutely_prediction[minute_key] = frac * estimated_yearly_total

    return minutely_prediction


# Main used for generating the model
if __name__ == "__main__":
    df = pd.read_csv("Electricity_consumption.csv")
    df["Datetime"] = pd.to_datetime(df["Date"]+" " + df["Time"], dayfirst=True)
    df = df.drop(columns=["Date", "Time"])
    df = df.set_index("Datetime")

    # checking for issues
    print(df.head())
    print(df.index.min())
    print(df.index.max())
    full_range = pd.date_range(start=df.index.min(), end=df.index.max(), freq='T')  # 'T' = minutes
    missing_timestamps = full_range.difference(df.index)
    print(f"Number of missing timestamps: {len(missing_timestamps)}")
    missing_power_rows = df['Global_active_power'].isna().sum()
    print(f"Number of missing 'Global_active_power' values: {missing_power_rows}")
    print(df[df['Global_active_power'].isna()])
    assert len(missing_timestamps) == 0 and missing_power_rows == 0, "Dataset is incomplete!"

    df['Global_active_power'] = pd.to_numeric(df['Global_active_power'], errors='coerce')

    # 2006 and 2010 are not complete years, ignoring them
    df = df.loc[(df.index.year >= 2007) & (df.index.year <= 2009)]

    # Calculating average between the three years for each minute
    df['MinuteOfYear'] = df.index.strftime('%m-%d %H:%M')
    minute_average = df.groupby('MinuteOfYear')['Global_active_power'].mean()
    total_energy = minute_average.sum()

    month_of_minute = pd.to_datetime('2008-' + minute_average.index, format='%Y-%m-%d %H:%M').month
    monthly_energy = minute_average.groupby(month_of_minute).sum()
    monthly_fraction = (monthly_energy / total_energy).to_dict()
    print("Monthly Fractions:")
    print(monthly_fraction)

    minute_fraction = (minute_average / total_energy).to_dict()

    print("First few minute fractions:")
    for k in list(minute_fraction.keys())[:5]:
        print(k, ":", minute_fraction[k])

    # Saving fractions to JSON
    save_data = {
        'monthly_fraction': monthly_fraction,
        'minute_fraction': minute_fraction
    }
    with open('consumption_model.json', 'w') as f:
        json.dump(save_data, f, indent=4)
    print("Model saved to consumption_model.json")

