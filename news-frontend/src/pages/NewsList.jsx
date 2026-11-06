import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function NewsList() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  // Состояния для фильтров
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Функция загрузки с учетом фильтров
  const fetchNews = () => {
    // Формируем параметры запроса (например, ?search=...&category=...)
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    axios.get('http://127.0.0.1:8000/news', { params })
      .then(response => {
        setNews(response.data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Ошибка при загрузке новостей.");
      });
  };

  // Загружаем при старте
  useEffect(() => {
    fetchNews();
  }, []); // Пустой массив = загрузить один раз при открытии

  const handleDelete = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить новость?")) {
      axios.delete(`http://127.0.0.1:8000/news/${id}`)
        .then(() => fetchNews())
        .catch(err => console.error("Ошибка удаления", err));
    }
  };

  // Обработчик поиска (вызывается при нажатии кнопки или Enter)
  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews();
  };

  // Обработчик сброса фильтров
  const handleReset = () => {
    setSearch('');
    setCategory('');
    // Небольшая хитрость: чтобы сбросить и сразу загрузить все,
    // передаем пустые параметры напрямую
    axios.get('http://127.0.0.1:8000/news')
      .then(response => setNews(response.data))
      .catch(err => console.error(err));
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/create" className="btn btn-success">Добавить новость</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Панель поиска и фильтрации */}
      <div className="card mb-4 bg-light">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Поиск по заголовку</label>
              <input
                type="text"
                className="form-control"
                placeholder="Введите слово..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Категория</label>
              <input
                type="text"
                className="form-control"
                placeholder="Например, IT"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1">Найти</button>
              <button type="button" onClick={handleReset} className="btn btn-outline-secondary">Сброс</button>
            </div>
          </form>
        </div>
      </div>

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Заголовок</th>
            <th>Категория</th>
            <th>Просмотры</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {news.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">Ничего не найдено</td>
            </tr>
          ) : (
            news.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                    <Link to={`/news/${item.id}`} className="text-decoration-none fw-bold">{item.title}</Link>
                </td>
                <td><span className="badge bg-secondary">{item.category}</span></td>
                <td>{item.views}</td>
                <td>
                  <Link to={`/edit/${item.id}`} className="btn btn-sm btn-warning me-2">Ред.</Link>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">Удал.</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NewsList;