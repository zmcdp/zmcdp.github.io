import requests
from bs4 import BeautifulSoup
import re
import json
import schedule
import time
from datetime import datetime

URL = "https://en.wikipedia.org/wiki/Deaths_in_2024"

def read_json_predictions(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return [item['celebrity'] for item in data['predictions']]

def update_json_data(file_path, matches):
    data = read_json_data(file_path)
    if 'matches' not in data:
        data['matches'] = []
    for match in matches:
        if match not in data['matches']:
            data['matches'].append(match)
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

def scrape_deaths(url):
    names = []
    current_date = None

    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')

        for heading in soup.find_all(['h2', 'h3', 'ul']):
            if heading.name in ['h2', 'h3'] and heading.span and 'mw-headline' in heading.span.attrs.get('class', []):
                current_date = heading.span.text.strip()
            elif heading.name == 'ul' and current_date:
                for li in heading.find_all('li'):
                    text = li.get_text()
                    name_match = re.match(r"^(.*?)(,|\u2013)", text)
                    if name_match:
                        name = name_match.group(1).strip()
                        names.append(name)

    return names

def send_push_notification(title, body):
    api_key = ""
    data_send = {"type": "note", "title": title, "body": body}
    response = requests.post('https://api.pushbullet.com/v2/pushes', json=data_send,
                             headers={'Authorization': 'Bearer ' + api_key,
                                      'Content-Type': 'application/json'})
    if response.status_code != 200:
        raise Exception('Pushbullet notification failed.')


def scheduled_task():
    print(f"Running scheduled task at {datetime.now()}")
    predictions = read_json_predictions("data.json")
    scraped_names = scrape_deaths(URL)
    find_matches(predictions, scraped_names)

def find_matches(json_data, scraped_data):
    matches = set(json_data) & set(scraped_data)
    for match in matches:
        print(f"Match found: {match}")
        send_push_notification("Match Found!", f"A match was found: {match}")

schedule.every().day.at("11:30").do(scheduled_task)

if __name__ == "__main__":
    json_file_path = "data.json"
    predictions = read_json_predictions(json_file_path)
    scraped_names = scrape_deaths(URL)
    find_matches(predictions, scraped_names)
    while True:
        schedule.run_pending()
        time.sleep(60)
