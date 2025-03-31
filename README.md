# Emi: Task Reminder App

**Emi** is a simple yet effective web application designed to remind users to complete tasks and take breaks. Whether you need a nudge to stay on schedule or a gentle reminder to prioritize self-care, Emi has you covered.

Check out the demo video here: 

![Emi: Task Reminder App Demo](https://i9.ytimg.com/vi_webp/Et_nOuvK6xc/mq1.webp?sqp=CNSLrL8G-oaymwEmCMACELQB8quKqQMa8AEB-AHUBoAC4AOKAgwIABABGBUgWCh_MA8%3D&rs=AOn4CLBK0YXe77UicR-1NgmePVk3fDQdUA&retry=4)
(https://youtu.be/Et_nOuvK6xc)

---

## Table of Contents

1. [How to Run](#how-to-run)
2. [Features](#features)
3. [Dependencies](#dependencies)
4. [License](#license)
5. [Contribution](#contribution)

---

## How to Run

Follow these steps to run the application locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SanjanaJairam/Emi-Bot.git
   cd Emi-Bot
   ```

2. **Install Dependencies**:
   Use pip to install the required dependencies.
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**:
   Start the Flask server.
   ```bash
   python main.py
   ```

4. **Access the App**:
   - **Home Page**: Open your web browser and navigate to [http://127.0.0.1:5000/](http://127.0.0.1:5000/).
   - **Calendar Page**: Access the calendar by visiting [http://127.0.0.1:5000/cal](http://127.0.0.1:5000/cal).

---

## Features

1. **Home Page**:
   - Emi warmly welcomes users to the Task Reminder app.
   - Simple and intuitive UI for quick access to features.

2. **Calendar Page**:
   - Displays a list of upcoming events and tasks.
   - Helps users organize their schedule effectively.

3. **Smart Reminders**:
   - **Break Reminders**: Emi reminds users to take breaks every 30 minutes (demo triggers break reminders after 5 seconds).
   - **Eat and Sleep Reminders**:
     - Reminder to eat is triggered 10 seconds after the tasks page is loaded (for demo purposes).
     - Reminder to sleep is triggered 15 seconds after the tasks page is loaded (for demo purposes).

4. **User-Centric Design**:
   - Emi aims to enhance productivity while promoting well-being.

---

## Contribution

Contributions are welcome! Whether you have suggestions for new features, bug fixes, or UI improvements, feel free to submit a pull request or open an issue.

---

## License

This project is open-source and available under the [MIT License](https://github.com/SanjanaJairam/Emi-Bot/blob/main/LICENSE).
