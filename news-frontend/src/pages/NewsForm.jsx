import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

function NewsForm() {
  const [formData, setFormData] = useState({
    title: '', content: '', category: '', author: ''
  });
  const [categories, setCategories] = useState([]); // Состояние для категорий
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Ошибка загрузки категорий", err));
  }, []);

  useEffect(() => {
    if (id) {
      axios.get(`http://127.0.0.1:8000/news/${id}`)
        .then(res => setFormData(res.data))
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const request = id
      ? axios.put(`http://127.0.0.1:8000/news/${id}`, formData)
      : axios.post('http://127.0.0.1:8000/news', formData);

    request
      .then(() => navigate('/'))
      .catch(err => {
        console.error(err);
        alert("Ошибка при сохранении");
        setLoading(false);
      });
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h1>{id ? 'Редактировать новость' : 'Создать новость'}</h1>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Заголовок</label>
          <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Категория</label>
            <input
              type="text"
              className="form-control"
              name="category"
              list="category-list"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Выберите или введите новую..."
            />
          <datalist id="category-list">
            {categories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
      </div>

        <div className="mb-3">
          <label className="form-label">Автор</label>
          <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Текст новости</label>
          <textarea className="form-control" name="content" rows="5" value={formData.content} onChange={handleChange} required></textarea>
        </div>

        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <Link to="/" className="btn btn-secondary">Отмена</Link>
      </form>
    </div>
  );
}

export default NewsForm;