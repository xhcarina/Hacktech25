from conductor.conductor import WorkerHost
from worker import NewsScraperWorker

def main():
    # Configuration (replace with your server details)
    config = {
        "server_url": "http://localhost:8080/api",  # Your Conductor server
        "api_path": "/api",
        "auth_token": "your_jwt_token"  # If using auth
    }
    
    # Initialize worker
    worker = NewsScraperWorker()
    
    # Start polling (automatically "registers" the worker)
    worker_host = WorkerHost(workers=[worker], **config)
    worker_host.start()  # Runs forever until interrupted

if __name__ == "__main__":
    main()