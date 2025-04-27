from conductor.conductor import WorkerHost
from conductor.conductor import Task
from conductor.conductor import TaskResult
from webscrape import get_conflict_news, get_descriptions

class NewsScraperWorker:
    def __init__(self):
        self.task_type = "python_web_articles"  # Must match workflow task name
    
    def execute(self, task: Task) -> TaskResult:
        try:
            # Get input from workflow
            region = task.input_data.get("region", "Ukraine")
            
            # Execute business logic
            news_json = get_conflict_news(region)
            descriptions = get_descriptions(region)
            
            # Prepare result
            result = TaskResult(task)
            result.add_output_data("news", news_json)
            result.add_output_data("descriptions", descriptions)
            result.status = "COMPLETED"
            return result
            
        except Exception as e:
            result = TaskResult(task)
            result.status = "FAILED"
            result.reason_for_incompletion = str(e)
            return result