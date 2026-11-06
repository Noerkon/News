import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  // Получаем текущий путь, чтобы подсвечивать активную ссылку
  const location = useLocation();

  // Вспомогательная функция для проверки активной страницы
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          📰 News Portal
        </Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                Главная
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/create')}`} to="/create">
                Добавить новость
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;