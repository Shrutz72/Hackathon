import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from datetime import datetime
import numpy as np

# Load the dataset
# Assuming the dataset is downloaded and named 'indian_weather_data.csv'
data = pd.read_csv('wrepo.csv')

# Data Preprocessing
# Convert 'last_updated' to datetime and extract useful features
data['last_updated'] = pd.to_datetime(data['last_updated'])
data['hour'] = data['last_updated'].dt.hour
data['day_of_week'] = data['last_updated'].dt.dayofweek
data['month'] = data['last_updated'].dt.month
data['day_of_year'] = data['last_updated'].dt.dayofyear  # Adding day of the year as a feature

# Feature Engineering: Add more features
data['temp_lag1'] = data['temperature_celsius'].shift(1)  # Lagged temperature feature
data['temp_lag2'] = data['temperature_celsius'].shift(2)  # Second lagged temperature feature
data['temp_rolling_mean'] = data['temperature_celsius'].rolling(window=3).mean()  # Rolling mean
data.dropna(inplace=True)  # Drop rows with NaN values due to lagged features

# Features and target variable
features = [
    'latitude', 'longitude', 'hour', 'day_of_week', 'month', 'day_of_year',
    'wind_kph', 'pressure_mb', 'humidity', 'cloud', 'uv_index',
    'temp_lag1', 'temp_lag2', 'temp_rolling_mean'
]
target = 'temperature_celsius'

# Splitting the data
X = data[features]
y = data[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Hyperparameter Tuning for GradientBoostingRegressor
param_grid = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.01, 0.1, 0.2],
    'max_depth': [3, 5, 7],
    'min_samples_split': [2, 5, 10]
}

model = GradientBoostingRegressor(random_state=42)
grid_search = GridSearchCV(estimator=model, param_grid=param_grid, cv=3, scoring='neg_mean_absolute_error')
grid_search.fit(X_train, y_train)

# Best model after hyperparameter tuning
best_model = grid_search.best_estimator_

# Evaluate the model
predictions = best_model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)
print(f'Mean Absolute Error after tuning: {mae:.4f}')
print(f'R-squared (Accuracy): {r2:.4f}')

# Function to forecast weather and provide precautions
def forecast_weather(latitude, longitude, date, wind_kph, pressure_mb, humidity, cloud, uv_index, temp_lag1, temp_lag2, temp_rolling_mean):
    # Extract features from the date
    date = pd.to_datetime(date)
    hour = date.hour
    day_of_week = date.dayofweek
    month = date.month
    day_of_year = date.dayofyear

    input_data = pd.DataFrame({
        'latitude': [latitude],
        'longitude': [longitude],
        'hour': [hour],
        'day_of_week': [day_of_week],
        'month': [month],
        'day_of_year': [day_of_year],
        'wind_kph': [wind_kph],
        'pressure_mb': [pressure_mb],
        'humidity': [humidity],
        'cloud': [cloud],
        'uv_index': [uv_index],
        'temp_lag1': [temp_lag1],
        'temp_lag2': [temp_lag2],
        'temp_rolling_mean': [temp_rolling_mean]
    })
    predicted_temp = best_model.predict(input_data)[0]
    
    precautions = []
    if predicted_temp > 30:
        precautions.append("Stay hydrated and avoid prolonged exposure to the sun.")
    if predicted_temp < 10:
        precautions.append("Wear warm clothing and protect yourself from the cold.")
    if humidity > 70:
        precautions.append("High humidity can cause discomfort; stay in well-ventilated areas.")
    if wind_kph > 20:
        precautions.append("Strong winds expected; secure loose objects and be cautious outdoors.")
    if uv_index > 6:
        precautions.append("High UV index; use sunscreen and wear protective clothing.")
    
    return predicted_temp, precautions

# Function to get user input and find the closest location in the dataset
def get_user_input_and_forecast():
    # Get user input for the place
    location_name = input("Enter the location name (e.g., Mumbai): ").strip().lower()
    
    # Find the closest match in the dataset
    location_data = data[data['location_name'].str.lower() == location_name]
    
    if location_data.empty:
        print(f"Location '{location_name}' not found in the dataset.")
        return
    
    # Use the first match (you can add more logic to handle multiple matches)
    location = location_data.iloc[0]
    
    # Get user input for the future date
    future_date = input("Enter the date for the forecast (YYYY-MM-DD): ").strip()
    try:
        future_date = pd.to_datetime(future_date)
    except ValueError:
        print("Invalid date format. Please use YYYY-MM-DD.")
        return
    
    # Extract relevant features for forecasting
    latitude = location['latitude']
    longitude = location['longitude']
    wind_kph = location['wind_kph']
    pressure_mb = location['pressure_mb']
    humidity = location['humidity']
    cloud = location['cloud']
    uv_index = location['uv_index']
    temp_lag1 = location['temp_lag1']
    temp_lag2 = location['temp_lag2']
    temp_rolling_mean = location['temp_rolling_mean']
    
    # Forecast weather
    predicted_temp, precautions = forecast_weather(latitude, longitude, future_date, wind_kph, pressure_mb, humidity, cloud, uv_index, temp_lag1, temp_lag2, temp_rolling_mean)
    
    # Output results
    print(f"\nWeather Forecast for {location['location_name']} on {future_date.strftime('%Y-%m-%d')}:")
    print(f"Predicted Temperature: {predicted_temp:.2f}°C")
    print("Precautions:")
    for precaution in precautions:
        print(f"- {precaution}")

# Run the program
get_user_input_and_forecast()