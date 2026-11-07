import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function NewsDetail() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Получаем ID из URL

  const fetchNews = () => {
    axios.get(`http://127.0.0.1:8000/news/${id}`)
      .then(res => {
        setNews(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();
  }, [id]);

  const handleView = () => {
    axios.post(`http://127.0.0.1:8000/news/${id}/view`)
      .then(() => {
        fetchNews();
      })
      .catch(err => console.error("Ошибка просмотра", err));
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU');
  };

  if (loading) return <div className="container mt-5"><h3>Загрузка...</h3></div>;
  if (!news) return <div className="container mt-5"><h3>Новость не найдена</h3></div>;

  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <Link to="/" className="btn btn-outline-secondary mb-4">&larr; Назад к списку</Link>

      <div className="card shadow-sm">
        <div className="card-body p-5">
          <h1 className="card-title mb-3">{news.title}</h1>

          <div className="d-flex justify-content-between text-muted mb-4 border-bottom pb-3">
            <span>
              <strong>Категория:</strong> <span className="badge bg-secondary">{news.category}</span>
            </span>
            <span><strong>Автор:</strong> {news.author}</span>
            <span><strong>Дата:</strong> {formatDate(news.published_at)}</span>
          </div>

          <p className="card-text fs-5" style={{ whiteSpace: 'pre-wrap' }}>
            {news.content}
          </p>

          <div className="mt-5 pt-3 border-top d-flex justify-content-between align-items-center">
            <span className="fs-5">👁 Просмотры: <strong>{news.views}</strong></span>
            <button onClick={handleView} className="btn btn-primary">
              Я прочитал ( +1 )
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsDetail;