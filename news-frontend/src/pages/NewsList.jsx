import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function NewsList() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  // Состояния для фильтров и поиска
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Состояния для сортировки
  const [sortBy, setSortBy] = useState('published_at');
  const [order, setOrder] = useState('desc');

  // Функция загрузки с учетом всех параметров
  const fetchNews = () => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (sortBy) params.sort_by = sortBy;
    if (order) params.order = order;

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
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить новость?")) {
      axios.delete(`http://127.0.0.1:8000/news/${id}`)
        .then(() => fetchNews())
        .catch(err => console.error("Ошибка удаления", err));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setSortBy('published_at');
    setOrder('desc');

    // Запрос без параметров, чтобы вернуть всё
    axios.get('http://127.0.0.1:8000/news')
      .then(response => setNews(response.data))
      .catch(err => console.error(err));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Все новости</h2>
        <Link to="/create" className="btn btn-success">Добавить новость</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Панель поиска, фильтрации и сортировки */}
      <div className="card mb-4 bg-light shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">

            <div className="col-md-3">
              <label className="form-label">Поиск по заголовку</label>
              <input
                type="text"
                className="form-control"
                placeholder="Введите слово..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Категория</label>
              <input
                type="text"
                className="form-control"
                placeholder="Например, IT"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Сортировать по</label>
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="published_at">Дате</option>
                <option value="views">Просмотрам</option>
              </select>
            </div>

            <div className="col-md-1">
              <label className="form-label">Порядок</label>
              <select className="form-select" value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="desc">↓</option>
                <option value="asc">↑</option>
              </select>
            </div>

            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1">Найти</button>
              <button type="button" onClick={handleReset} className="btn btn-outline-secondary">Сброс</button>
            </div>

          </form>
        </div>
      </div>

      <table className="table table-striped table-hover shadow-sm">
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
                  <Link to={`/news/${item.id}`} className="text-decoration-none fw-bold">
                    {item.title}
                  </Link>
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