@echo off
echo ==============================================
echo  Starting Vigilant Site Django Backend Server
echo ==============================================
call .\venv\Scripts\activate.bat
cd backend
python manage.py runserver 127.0.0.1:8000
pause
