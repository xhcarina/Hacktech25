from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    # TODO: ML model prediction logic
    return jsonify({"predicted_loss": 5000})

@app.route("/donate", methods=["POST"])
def donate():
    # TODO: Save to MongoDB
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)