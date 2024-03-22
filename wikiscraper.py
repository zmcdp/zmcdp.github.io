import requests
from bs4 import BeautifulSoup
import re
import json

URL = "https://en.wikipedia.org/wiki/Deaths_in_2024"

def scrape_deaths_by_date(url):
    deceased_list = []
    current_date = None

    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser', from_encoding='utf-8')

        for heading in soup.find_all(['h2', 'h3', 'ul']):
            if heading.name in ['h2', 'h3'] and heading.span and 'mw-headline' in heading.span.attrs.get('class', []):
                current_date = heading.span.text.strip()
            elif heading.name == 'ul' and current_date:
                for li in heading.find_all('li'):
                    text = li.get_text()
                    name_age_match = re.match(r"^(.*?)(,|\u2013) (\d+)", text)
                    if name_age_match:
                        name = name_age_match.group(1).strip()
                        name = re.sub(r'\s*\[.*?\]\s*', '', name).strip()
                        age = name_age_match.group(3).strip()
                        deceased_list.append({"name": name, "age": int(age)})

    return deceased_list

def update_json_deceased(file_path, deceased_list):
    with open(file_path, 'r+', encoding='utf-8') as file:
        data = json.load(file)
        data['deceased'].extend(deceased_list)
        file.seek(0)
        json.dump(data, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    json_file_path = "data.json"
    scraped_deceased = scrape_deaths_by_date(URL)
    update_json_deceased(json_file_path, scraped_deceased)