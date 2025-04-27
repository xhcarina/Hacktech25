from gnews import GNews
import json
import openai
from dotenv import load_dotenv
import os

from pathlib import Path

# Hardcode the full path
load_dotenv(dotenv_path="C:/Users/white/Downloads/coding/Hacktech2025/.venv/.env")

openai.api_key = os.getenv("OPENAI_API_KEY")

def get_conflict_news(region, num_articles=5):
    google_news = GNews(language='en', country='US', max_results=num_articles)
    articles = google_news.get_news(f"{region} conflict")
    
    result = []
    for article in articles:
        result.append({
            "title": article.get('title', ''),
            "link": article.get('url', ''),
            "published date": article.get('published date', ''),
            "description": article.get('description', '')
        })

    return json.dumps(result, indent=2)

def get_descriptions(region, num_articles=5):
    google_news = GNews(language='en', country='US', max_results=num_articles)
    articles = google_news.get_news(f"{region} conflict")

    # Build the list of descriptions
    descriptions_list = [article.get('description', '') for article in articles]
    all_text = ' '.join(descriptions_list)

    return all_text

def get_event_severity_score(news_text):
    prompt = f"""You are an expert financial risk analyst. Given the following news event:
News text: {news_text}
1. Assign an event severity score between 0 (no impact) and 100 (catastrophic impact)
2. Provide a detailed rationale for your scoring
3. Format your response as: "Score: [X]\n\nRationale: [Y]"""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # or "gpt-3.5-turbo"
        messages=[
            {"role": "system", "content": "You are an expert financial risk analyst."},
            {"role": "user", "content": prompt}
        ],
        temperature=0  # Low randomness for consistent scoring
    )

    score = response['choices'][0]['message']['content'].strip()
    return score

# Example usage
region = "Ukraine"
all_descriptions = get_descriptions(region)
severity_score = get_event_severity_score(all_descriptions)

print(f"Event severity score: {severity_score}")