# Required libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler

# Step 1: Load the dataset
data = pd.read_csv('displaced_individuals_with_age.csv')

# Step 2: Encode categorical variables
shelter_map = {'None': 1.0, 'Partial': 0.5, 'Full': 0.0}
food_access_map = {'None': 1.0, 'Partial': 0.5, 'Full': 0.0}
location_map = {'Urban': 0.3, 'Rural': 0.7}
age_group_map = {'Child (0-17)': 1.0, 'Adult (18-59)': 0.0, 'Elder (60+)': 0.7}

# Fill any missing values with the worst case scenario (highest urgency)
data['Shelter_Status'] = data['Shelter_Status'].fillna('None')
data['Food_Water_Access'] = data['Food_Water_Access'].fillna('None')
data['Location_Type'] = data['Location_Type'].fillna('Rural')
data['Age_Group'] = data['Age_Group'].fillna('Child (0-17)')

# Map the categorical features
data['Shelter_Status_Num'] = data['Shelter_Status'].map(shelter_map)
data['Food_Water_Access_Num'] = data['Food_Water_Access'].map(food_access_map)
data['Location_Type_Num'] = data['Location_Type'].map(location_map)
data['Age_Group_Num'] = data['Age_Group'].map(age_group_map)

# Step 3: Define features for the model
features = [
    'Event_Severity',
    'Economic_Loss_USD',
    'Shelter_Status_Num',
    'Food_Water_Access_Num',
    'Health_Severity_Score',
    'Family_Size',
    'Time_Since_Displacement_Days',
    'Location_Type_Num',
    'Age_Group_Num'
]

# Fill any missing numerical values with worst case
for col in ['Health_Severity_Score', 'Event_Severity', 'Economic_Loss_USD', 'Family_Size', 'Time_Since_Displacement_Days']:
    data[col] = data[col].fillna(data[col].max())

X = data[features]

# Step 4: Normalize all features to 0-1 scale
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Step 5: Simulate urgency scores as target (as we don't have real labels)
feature_weights = [0.30, 0.25, 0.20, 0.15, 0.10, 0.05, 0.05, 0.05, 0.05]
y_simulated = np.zeros(len(X))
for i, weight in enumerate(feature_weights):
    y_simulated += weight * X_scaled[:, i]

# Clip values to ensure they're in 0-1 range
y_simulated = np.clip(y_simulated, 0, 1)

# Scale urgency score from 0-1 to 0-100
y_simulated_100 = y_simulated * 100

# Step 6: Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_simulated_100, test_size=0.2, random_state=42)

# Step 7: Train a Random Forest model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Step 8: Evaluate the model
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Model R-squared on training data: {train_score:.4f}")
print(f"Model R-squared on test data: {test_score:.4f}")

# Step 9: Feature importance analysis
feature_importances = pd.DataFrame({
    'Feature': features,
    'Importance': model.feature_importances_
}).sort_values('Importance', ascending=False)
print("\nFeature Importance:")
print(feature_importances)

# Step 10: Predict urgency scores on the entire dataset
urgency_scores_predicted = model.predict(X_scaled)

# Save predicted scores back into the dataset
data['Rule_Based_Urgency_Score'] = y_simulated_100
data['ML_Predicted_Urgency_Score'] = urgency_scores_predicted

# Save the final dataset with predictions
data.to_csv('final_dataset_with_realML_scores.csv', index=False)

print(f"\nProcessed {len(data)} records with real ML model.")
print("Original rule-based and new ML-based scores saved to final_dataset_with_realML_scores.csv")