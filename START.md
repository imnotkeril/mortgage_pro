# Инструкция по запуску Mortgage Pro

## Быстрый старт

### 1. Активация виртуального окружения

```powershell
# Если виртуальное окружение еще не создано
python -m venv .venv

# Активация (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Или для CMD
.venv\Scripts\activate.bat
```

### 2. Установка зависимостей (если еще не установлены)

```powershell
# Backend зависимости
pip install -r backend/requirements.txt

# Frontend зависимости
cd frontend
npm install
cd ..
```

### 3. Настройка OpenAI API (для AI функций)

Убедитесь, что файл `backend/.env` существует и содержит ваш API ключ:
```
OPENAI_API_KEY=your_actual_api_key_here
OPENAI_MODEL=gpt-4
```

### 4. Запуск приложения

**Важно:** Нужно запустить два сервера одновременно - backend и frontend.

#### Вариант 1: Два отдельных терминала

**Терминал 1 - Backend:**
```powershell
# Активируйте виртуальное окружение (если еще не активировано)
.venv\Scripts\Activate.ps1

# Запустите backend сервер
python backend/run.py --mode=api
```

Backend будет доступен на: http://localhost:5000

**Терминал 2 - Frontend:**
```powershell
# Перейдите в директорию frontend
cd frontend

# Запустите frontend сервер
npm start
```

Frontend будет доступен на: http://localhost:3000

#### Вариант 2: PowerShell фоновые задачи

```powershell
# Backend в фоне
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .venv\Scripts\Activate.ps1; python backend/run.py --mode=api"

# Frontend в фоне
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"
```

### 5. Открытие приложения

После запуска обоих серверов:
- Откройте браузер и перейдите на http://localhost:3000
- Backend API будет доступен на http://localhost:5000

## Проверка работы

1. **Backend проверка:**
   - Откройте http://localhost:5000/ в браузере
   - Должно появиться: `{"message": "API is running! Welcome to Mortgage Calculator Pro."}`

2. **Frontend проверка:**
   - Откройте http://localhost:3000
   - Должен загрузиться интерфейс приложения

3. **AI функции:**
   - Перейдите на вкладку "AI Assistant" в приложении
   - Убедитесь, что `backend/.env` содержит правильный OpenAI API ключ

## Остановка серверов

- В терминалах нажмите `Ctrl+C`
- Или закройте окна терминалов

## Возможные проблемы

### Backend не запускается
- Убедитесь, что виртуальное окружение активировано
- Проверьте, что все зависимости установлены: `pip install -r backend/requirements.txt`
- Проверьте, что порт 5000 свободен

### Frontend не запускается
- Убедитесь, что зависимости установлены: `cd frontend && npm install`
- Проверьте, что порт 3000 свободен
- Попробуйте очистить кэш: `npm cache clean --force`

### AI функции не работают
- Проверьте файл `backend/.env` - должен содержать реальный OpenAI API ключ
- Убедитесь, что ключ валидный и имеет достаточный баланс на OpenAI
- Проверьте консоль браузера на наличие ошибок

## Docker запуск (альтернатива)

Если у вас установлен Docker:
```powershell
docker-compose up
```

Это запустит оба сервера в контейнерах.
