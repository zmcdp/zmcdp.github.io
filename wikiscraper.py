import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime

def get_month_urls(year, current_month):
    months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"]
    month_urls = [{"url": f"https://en.wikipedia.org/wiki/Deaths_in_{year}", "month": "current month"}]
    for month in months[:current_month-1]: # -1 to exclude the current month
        month_urls.append({"url": f"https://en.wikipedia.org/wiki/Deaths_in_{month}_{year}", "month": month})
    return month_urls

def scrape_deaths_by_date(url, month):
    deceased_list = []
    current_date = None

    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser', from_encoding='utf-8')

        for heading in soup.find_all(['h2', 'h3', 'ul']):
            if heading.name in ['h2', 'h3'] and heading.span and 'mw-headline' in heading.span.attrs.get('class', []):
                current_date = heading.span.text.strip()
                # For the yearly page, only process the current month
                if month == "current month" and current_date != datetime.now().strftime("%B"):
                    current_date = None
            elif heading.name == 'ul' and current_date:
                for li in heading.find_all('li'):
                    text = li.get_text()
                    name_age_match = re.match(r"^(.*?)(,|\u2013) (\d+)", text)
                    if name_age_match:
                        name = name_age_match.group(1).strip()
                        name = re.sub(r'\s*\[.*?\]\s*', '', name).strip()
                        age = name_age_match.group(3).strip()
                        deceased_list.append({"date": current_date, "name": name, "age": int(age)})
    return deceased_list

def update_json_deceased(file_path, deceased_list):
    try:
        with open(file_path, 'r+', encoding='utf-8') as file:
            data = json.load(file)
    except FileNotFoundError:
        data = {'deceased': []}
    data['deceased'].extend(deceased_list)
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    year = datetime.now().year
    current_month = datetime.now().month
    json_file_path = "data.json"

    month_urls = get_month_urls(year, current_month)
    for item in month_urls:
        url = item["url"]
        month = item["month"]
        scraped_deceased = scrape_deaths_by_date(url, month)
        update_json_deceased(json_file_path, scraped_deceased)
