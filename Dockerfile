FROM python:3.11-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock README.md ./

RUN poetry config virtualenvs.create false && poetry install --only main --no-root

COPY . .

ENV PYTHONPATH=/app/src

CMD ["uvicorn", "messenger.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
