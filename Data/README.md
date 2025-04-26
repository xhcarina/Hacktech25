# Displaced Individuals Urgency Assessment API

This API allows you to assess the urgency needs of displaced individuals using a machine learning model trained on historical data.

## Setup

1. Make sure you have the required dependencies:
   ```
   pip install flask pandas numpy scikit-learn
   ```

2. The reference dataset `displaced_individuals_with_age.csv` should be in the same directory as the API handler.

## Running the API

Start the Flask server by running:
```
python api_handler.py
```

This will start a local server at `http://localhost:5000`.

## Testing Without the Server

You can test the API without running the Flask server by using a sample JSON file:
```
python api_handler.py sample_input.json
```

## API Usage

### Endpoint

`POST /api/urgency-assessment`

### Request Format

```json
{
  "individuals": [
    {
      "name": "John Doe",
      "origin": "Syria",
      "location_type": "Urban",
      "event_severity": 75.0,
      "economic_loss_usd": 3500.0,
      "shelter_status": "Partial",
      "food_water_access": "Partial",
      "health_risk": "Low Risk",
      "health_severity_score": 25.0,
      "family_size": 4,
      "time_since_displacement_days": 120,
      "displacement_start_date": "2024-01-15",
      "displacement_end_date": null,
      "age": 34,
      "age_group": "Adult (18-59)"
    }
  ]
}
```

### Response Format

```json
{
  "status": "success",
  "results": [
    {
      "name": "John Doe",
      "urgency_score": 65.78,
      "priority_level": "High",
      "feature_contributions": {
        "event_severity": 22.5,
        "economic_loss": 8.75,
        "shelter_status": 10.0,
        "food_water_access": 7.5,
        "health_severity": 2.5,
        "family_size": 2.0,
        "time_since_displacement": 3.0,
        "location_type": 1.5,
        "age_group": 0.0
      }
    }
  ]
}
```

## Feature Values

### Categorical Features

- `shelter_status`: "None" (1.0), "Partial" (0.5), or "Full" (0.0)
- `food_water_access`: "None" (1.0), "Partial" (0.5), or "Full" (0.0)
- `location_type`: "Urban" (0.3) or "Rural" (0.7)
- `age_group`: "Child (0-17)" (1.0), "Adult (18-59)" (0.0), or "Elder (60+)" (0.7)

### Numerical Features

All numerical features are normalized to a 0-1 scale using min-max scaling based on the reference dataset.

## Priority Levels

- **Critical**: Urgency score ≥ 70
- **High**: Urgency score ≥ 50 and < 70
- **Medium**: Urgency score ≥ 30 and < 50
- **Low**: Urgency score < 30 