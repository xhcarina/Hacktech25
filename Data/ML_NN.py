# Required libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.neural_network import MLPRegressor
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

# Step 7: Experiment with different regularization parameters to prevent overfitting
alphas = [0.0001, 0.001, 0.01, 0.1, 1.0]
results = []

print("Testing regularization parameters...")
for alpha in alphas:
    # Create model with L2 regularization (alpha parameter)
    model = MLPRegressor(
        hidden_layer_sizes=(16, 8),
        activation='relu',
        solver='adam',
        alpha=alpha,  # L2 regularization parameter
        max_iter=500,
        early_stopping=True,  # Stop training when validation score doesn't improve
        validation_fraction=0.1,  # Use 10% of training data for validation
        n_iter_no_change=10,  # Stop after 10 iterations with no improvement
        random_state=42
    )
    
    # Perform 5-fold cross-validation
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='r2')
    
    # Train the model on the full training set
    model.fit(X_train, y_train)
    
    # Evaluate on test set
    test_score = model.score(X_test, y_test)
    train_score = model.score(X_train, y_train)
    
    # Record results
    results.append({
        'alpha': alpha,
        'cv_mean': cv_scores.mean(),
        'cv_std': cv_scores.std(),
        'train_score': train_score,
        'test_score': test_score,
        'gap': train_score - test_score
    })

# Find the model with the smallest gap between training and test scores
best_model_idx = min(range(len(results)), key=lambda i: abs(results[i]['train_score'] - results[i]['test_score']))
best_alpha = alphas[best_model_idx]

# Retrain the best model
final_model = MLPRegressor(
    hidden_layer_sizes=(16, 8),
    activation='relu',
    solver='adam',
    alpha=best_alpha,
    max_iter=500,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=10,
    random_state=42
)
final_model.fit(X_train, y_train)

# Step 8: Final evaluation
train_score = final_model.score(X_train, y_train)
test_score = final_model.score(X_test, y_test)

print(f"\nBest alpha: {best_alpha} (train R²: {train_score:.4f}, test R²: {test_score:.4f}, diff: {train_score - test_score:.4f})")

# Step 9: Calculate feature importance using permutation importance
from sklearn.inspection import permutation_importance

try:
    result = permutation_importance(final_model, X_test, y_test, n_repeats=10, random_state=42)
    importance = result.importances_mean
    
    # Create a DataFrame for feature importance
    feature_importances = pd.DataFrame({
        'Feature': features,
        'Importance': importance
    }).sort_values('Importance', ascending=False)
    
    print("\nTop 3 features:")
    print(feature_importances.head(3).to_string(index=False))
except Exception:
    pass

# Step 10: Predict urgency scores on the entire dataset
urgency_scores_predicted = final_model.predict(X_scaled)

# Save predicted scores back into the dataset
data['Rule_Based_Urgency_Score'] = y_simulated_100
data['NN_Predicted_Urgency_Score'] = urgency_scores_predicted

# Save the final dataset with predictions
data.to_csv('final_dataset_with_regularized_NN_scores.csv', index=False)

print(f"\nProcessed {len(data)} records. Results saved to final_dataset_with_regularized_NN_scores.csv")