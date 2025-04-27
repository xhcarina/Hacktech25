#UPLOAD DATA TO MONGODB ATLAS*

'''{
    "timeseries": {
        "timeField": "Displacement_Start_Date",  # Required
        "metaField": "Origin",                  # Group by country
        "granularity": "hours",                 # Highest available level
        "bucketMaxSpanSeconds": 86400,          # 24 hours (1 day)
        "bucketRoundingSeconds": 86400           # Align to daily boundaries
    },
    "expireAfterSeconds": 63072000              # 2 years (optional)
}'''

#uri = "mongodb+srv://trangn12:TZW4iXPtNVSTfSHM@cluster0.ndrelyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Create a new client and connect to the server
#client = MongoClient(uri, server_api=ServerApi('1'))

# # Send a ping to confirm a successful connection
# try:
#     client.admin.command('ping')
#     print("Pinged your deployment. You successfully connected to MongoDB!")
# except Exception as e:
#     print(e)

import pandas as pd
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from tqdm import tqdm  # For progress bar
import sys
import os

# Configuration
# Hardcode the full path
load_dotenv(dotenv_path="C:/Users/white/Downloads/coding/Hacktech2025/.venv/.env")

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "humanitarian_tracker"     # Your database name
COLLECTION_NAME = "Users"   # Your existing time-series collection
CSV_PATH = "Hacktech25/Data/final_dataset_with_urgency_scores.csv"
CHUNK_SIZE = 50_000  # Adjust based on your system RAM

def upload_displacement_data():
    """Upload CSV data to existing MongoDB collection"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Verify collection exists
        if COLLECTION_NAME not in db.list_collection_names():
            print(f"Error: Collection '{COLLECTION_NAME}' not found!")
            sys.exit(1)
        
        # Get total rows for progress bar
        total_rows = sum(1 for _ in open(CSV_PATH, 'r', encoding='utf-8')) - 1 #subtract for header rows
        
        # Define dtype specifications for pandas
        dtype_spec = {
            'Name': 'str',
            'Origin': 'str',
            'Location_Type': 'str',
            'Event_Severity': 'float32',
            'Economic_Loss_USD': 'float32',
            'Shelter_Status': 'str',
            'Food_Water_Access': 'str',
            'Health_Risk': 'str',
            'Health_Severity_Score': 'float32',
            'Family_Size': 'int32',
            'Time_Since_Displacement_Days': 'int32',
            'Age': 'int32',
            'Age_Group': 'str',
            'Shelter_Status_Num': 'float32',
            'Food_Water_Access_Num': 'float32',
            'Location_Type_Num': 'float32',
            'Age_Group_Num': 'float32',
            'Urgency_Score_0_to_100': 'float32'
        }

        # Process CSV in chunks
        with tqdm(total=total_rows, desc="Uploading displacement data", unit="rows") as pbar:
            for chunk in pd.read_csv(
                CSV_PATH,
                chunksize=CHUNK_SIZE,
                dtype=dtype_spec,
                parse_dates=['Displacement_Start_Date', 'Displacement_End_Date']
            ):
                # Convert to dictionary records
                records = chunk.to_dict('records')
                
                # Insert batch
                if records:
                    collection.insert_many(records)
                
                # Update progress
                pbar.update(len(chunk))

        print(f"\nSuccess! Uploaded {total_rows:,} records to {COLLECTION_NAME}.")
        print(f"Sample document:")
        sample = collection.find_one({"Name": "Christina Ward"})
        for k, v in sample.items():
            print(f"{k}: {v} ({type(v).__name__})")

    except Exception as e:
        print(f"\nError during upload: {str(e)}")

if __name__ == "__main__":
    upload_displacement_data()
