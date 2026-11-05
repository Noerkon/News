from pydantic import BaseModel
from datetime import datetime

# 1. Базовая схема (общие поля для всех)
class NewsBase(BaseModel):
    title: str
    content: str
    category: str
    author: str

# 2. Схема для создания новости (POST)
# Клиент присылает только эти поля, id и дату сервер ставит сам
class NewsCreate(NewsBase):
    pass

# 3. Схема для обновления (PUT)
# Все поля необязательны, вдруг клиент хочет поменять только заголовок
class NewsUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    author: str | None = None

# 4. Схема для ответа (GET)
# Сервер отдаёт всё, включая id, просмотры и дату
class NewsResponse(NewsBase):
    id: int
    views: int
    published_at: datetime

    class Config:
        from_attributes = True  # Позволяет Pydantic читать данные из объектов SQLAlchemy