## Reminder App

Emi is a simple web application who reminds people to do tasks and take breaks. 

## How to Run

1. **Clone the Repository:**
   git clone https://github.iu.edu/sajairam/emibot.git
   cd emibot
2. **Install Dependencies:**
  pip install -r requirements.txt
3. **Run the Application:**
  python main.py
4. **Access the App:**
  Open your web browser and go to http://127.0.0.1:5000/ to access the home page, or http://127.0.0.1:5000/cal for the calendar page.

## Features

1. Home Page: Emi welcomes users to the Task Reminder app.
2. Calendar Page: Displays a simple list of upcoming events/tasks.
3. Reminders to take breaks every 30 mins
4. Reminders to eat and go to sleep
(For the purpose of the demo, reminder for break is called after 5 seconds, eat after 10 seconds and sleep after 15 seconds after the tasks page is loaded)

## Dependencies

Flask 2.0.1
