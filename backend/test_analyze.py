import requests

url = "http://localhost:8000/questionnaire/analyze"
# We need an auth token
login_res = requests.post("http://localhost:8000/auth/login", json={"email": "admin34@gmail.com", "password": "admin@123"})
token = login_res.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}
data = {
    "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"],
    "answers": ["A1", "A2", "A3", "A4", "A5"]
}
res = requests.post(url, headers=headers, json=data)
print(res.status_code)
print(res.text)
