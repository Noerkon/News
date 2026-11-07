from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker, Session
from models import Base, News
from schemas import NewsCreate, NewsUpdate, NewsResponse
from typing import List

# 1. Подключаемся к базе данных SQLite
DATABASE_URL = "sqlite:///./news.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# 2. Создаём сессию для работы с базой
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Создаём таблицы в базе данных
Base.metadata.create_all(bind=engine)

# 4. Создаём само приложение FastAPI
app = FastAPI(
    title="API Новостного портала",
    description="Лабораторная работа: управление новостями",
    version="1.0.0"
             )

# --- НАСТРОЙКА CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
                  )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/news", response_model=NewsResponse, summary="Создать новость")
def create_news(news: NewsCreate, db: Session = Depends(get_db)):
    """
    Создает новую новость. ID и дата публикации присваиваются автоматически.
    """
    db_news = News(**news.model_dump())
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    return db_news


@app.get("/news", response_model=List[NewsResponse], summary="Получить список новостей")
def get_news(
        category: str | None = Query(None, description="Фильтр по категории"),
        search: str | None = Query(None, description="Поиск по заголовку"),
        sort_by: str = Query("published_at", description="Сортировка: published_at (по дате) или views (по просмотрам)"),
        order: str = Query("desc", description="Порядок: asc (по возрастанию) или desc (по убыванию)"),
        db: Session = Depends(get_db)
            ):
    """
    Возвращает список новостей.
    Поддерживает фильтрацию по категории, поиск по заголовку и сортировку.
    """
    query = db.query(News)

    # 1. Фильтрация по категории
    if category:
        query = query.filter(News.category == category)

    # 2. Поиск по заголовку
    if search:
        words = search.split()
        if words:
            conditions = [News.title.ilike(f"%{word}%") for word in words]
            query = query.filter(or_(*conditions))

    # 3. Сортировка
    if sort_by == "views":
        sort_column = News.views
    else:
        sort_column = News.published_at

    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    return query.all()

@app.get("/news/{news_id}", response_model=NewsResponse, summary="Получить новость по ID")
def get_one_news(news_id: int, db: Session = Depends(get_db)):
    """
    Возвращает одну новость по её ID.
    Если новость не найдена, вернет ошибку 404.
    """
    db_news = db.query(News).filter(News.id == news_id).first()
    if db_news is None:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    return db_news


@app.put("/news/{news_id}", response_model=NewsResponse, summary="Обновить новость")
def update_news(news_id: int, news: NewsUpdate, db: Session = Depends(get_db)):
    """
    Обновляет поля новости. Можно передать только те поля, которые нужно изменить.
    """
    db_news = db.query(News).filter(News.id == news_id).first()
    if db_news is None:
        raise HTTPException(status_code=404, detail="Новость не найдена")

    update_data = news.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_news, key, value)

    db.commit()
    db.refresh(db_news)
    return db_news

@app.get("/categories", summary="Получить список всех категорий")
def get_categories(db: Session = Depends(get_db)):
    """
    Возвращает список уникальных категорий новостей.
    """
    categories = db.query(News.category).distinct().all()
    return [c[0] for c in categories]


@app.post("/news/{news_id}/view", summary="Увеличить счетчик просмотров")
def increment_views(news_id: int, db: Session = Depends(get_db)):
    """
    Увеличивает количество просмотров новости на 1.
    """
    db_news = db.query(News).filter(News.id == news_id).first()
    if db_news is None:
        raise HTTPException(status_code=404, detail="Новость не найдена")

    db_news.views += 1
    db.commit()
    db.refresh(db_news)
    return {"message": "Просмотр добавлен", "current_views": db_news.views}

@app.delete("/news/{news_id}", summary="Удалить новость")
def delete_news(news_id: int, db: Session = Depends(get_db)):
    """
    Удаляет новость по ID.
    """
    db_news = db.query(News).filter(News.id == news_id).first()
    if db_news is None:
        raise HTTPException(status_code=404, detail="Новость не найдена")
    db.delete(db_news)
    db.commit()
    return {"message": "Новость успешно удалена"}