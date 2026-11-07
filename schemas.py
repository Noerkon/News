from pydantic import BaseModel
from datetime import datetime

# 1. Базовая схема
class NewsBase(BaseModel):
    title: str
    content: str
    category: str
    author: str

# 2. Схема для создания новости (POST)
class NewsCreate(NewsBase):
    pass

# 3. Схема для обновления (PUT)
class NewsUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    author: str | None = None

# 4. Схема для ответа (GET)
class NewsResponse(NewsBase):
    id: int
    views: int
    published_at: datetime

    class Config:
        from_attributes = True  # Позволяет Pydantic читать данные из объектов SQLAlchemy