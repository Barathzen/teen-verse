import httpx
from app.core.config import settings

prompt = "Write a short, engaging 3-sentence story in the second person ('You...') about a teenager's day tomorrow. Their sleep changed from 4h to 8h. Their social media use changed from 4h to 4h. Their physical activity changed from 5/10 to 5/10. Their overall mental health risk score dropped from 50.0 to 30.0. Make it realistic, empathetic, and focus on the 'ripple effect' these specific habit changes have on their mood, focus, or energy."

headers = {
    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
    "HTTP-Referer": settings.OPENROUTER_HTTP_REFERER,
    "X-Title": settings.OPENROUTER_APP_TITLE,
    "Content-Type": "application/json"
}
payload = {
    "model": settings.OPENROUTER_MODEL,
    "messages": [{"role": "user", "content": prompt}],
    "temperature": 0.7,
    "max_tokens": 150,
}
try:
    with httpx.Client(timeout=15.0) as client:
        resp = client.post(settings.OPENROUTER_API_BASE_URL, json=payload, headers=headers)
        print("Status Code:", resp.status_code)
        print("Text:", resp.text)
        resp.raise_for_status()
        data = resp.json()
        print("Story:", data["choices"][0]["message"]["content"].strip())
except Exception as e:
    print(f"Exception: {e}")
