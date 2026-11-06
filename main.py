from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker, Session
from models import Base, News
from schemas import NewsCreate, NewsUpdate, NewsResponse
from typing import List

# 1. Подключаемся к базе данных SQLite (файл news.db появится в папке проекта)
DATABASE_URL = "sqlite:///./news.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# 2. Создаём сессию для работы с базой (через неё мы будем читать и писать данные)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Создаём таблицы в базе данных (берёт все классы, унаследованные от Base, и создаёт их)
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
    allow_origins=["*"],  # Разрешаем всем (для лабы сойдет, в проде так не делают)
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Разрешаем все заголовки
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
    # Превращаем Pydantic-схему в SQLAlchemy-модель (словарь -> объект базы)
    db_news = News(**news.model_dump())
    db.add(db_news)          # Добавляем в сессию
    db.commit()              # Сохраняем в базу
    db.refresh(db_news)      # Обновляем объект, чтобы получить сгенерированный id
    return db_news           # FastAPI сам превратит его в JSON по схеме NewsResponse


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
        # Разбиваем строку на слова, игнорируя лишние пробелы
        words = search.split()
        if words:
            # Создаем список условий: "в заголовке есть слово 1 ИЛИ слово 2 ИЛИ ..."
            conditions = [News.title.ilike(f"%{word}%") for word in words]
            # Объединяем их через ИЛИ и применяем к запросу
            query = query.filter(or_(*conditions))

    # 3. Сортировка
    # Выбираем колонку, по которой будем сортировать
    if sort_by == "views":
        sort_column = News.views
    else:
        sort_column = News.published_at  # По умолчанию по дате

    # Выбираем направление сортировки
    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())  # По умолчанию по убыванию

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

    # Проходимся по переданным полям (исключая те, что не переданы)
    update_data = news.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_news, key, value)  # Устанавливаем новое значение для атрибута

    db.commit()
    db.refresh(db_news)
    return db_news

@app.get("/categories", summary="Получить список всех категорий")
def get_categories(db: Session = Depends(get_db)):
    """
    Возвращает список уникальных категорий новостей.
    """
    # Достаем все категории из базы, убираем дубликаты
    categories = db.query(News.category).distinct().all()
    # Превращаем список кортежей [('Спорт',), ('Политика',)] в обычный список ['Спорт', 'Политика']
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