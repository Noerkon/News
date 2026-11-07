from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class News(Base):
    __tablename__ = "news"  # Название таблицы в базе данных

    id = Column(Integer, primary_key=True, index=True)  # Уникальный номер (автоматически)
    title = Column(String, index=True)                  # Заголовок
    content = Column(String)                            # Текст новости
    category = Column(String, index=True)               # Категория (Спорт, Политика и т.д.)
    author = Column(String)                             # Автор
    views = Column(Integer, default=0)                  # Просмотры (по умолчанию 0)
    published_at = Column(DateTime, default=datetime.utcnow)  # Дата публикации (ставится автоматически)