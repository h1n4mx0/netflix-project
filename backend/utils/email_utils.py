import smtplib
from email.message import EmailMessage
import os

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_verification_email(to_email, verify_link):
    msg = EmailMessage()
    msg['Subject'] = "Xác nhận đăng ký tài khoản Anieflix"
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg.set_content(f'''
Chào bạn,

Hãy xác nhận tài khoản Anieflix của bạn bằng cách click vào liên kết dưới đây:

{verify_link}

Nếu bạn không thực hiện đăng ký này, hãy bỏ qua email này.
''')

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)
