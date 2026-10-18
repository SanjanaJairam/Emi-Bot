from flask import render_template
from app import app
import datetime
# Static events array for testing
static_events = [
    {
        'summary': 'Build robot for HRI',
        'start': datetime.datetime.now().isoformat()  # Current date and time
    },
    {
        'summary': 'RA project discussion',
        'start': (datetime.datetime.now() + datetime.timedelta(days=1)).isoformat()  # Tomorrow's date and time
    },
    {
        'summary': 'TA Office Hours',
        'start': (datetime.datetime.now() + datetime.timedelta(days=2)).isoformat()  # Day after tomorrow
    },
    {
        'summary': 'Buy Groceries',
        'start': (datetime.datetime.now() + datetime.timedelta(days=3)).isoformat()
    }]


@app.route("/")
def home():
    return render_template("home.html")

@app.route("/cal")
def cal():
    events = static_events[:5]
    formatted_events = []
    for event in events:
        formatted_event = {
            'summary': event['summary'],
            'start': event['start']
        }
        formatted_events.append(formatted_event)
    return render_template("cal.html", events=formatted_events)
