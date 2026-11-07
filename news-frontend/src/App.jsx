import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import NewsList from './pages/NewsList';
import NewsForm from './pages/NewsForm';
import NewsDetail from './pages/NewsDetail';

function App() {
  return (
    <>
      <Navbar />

      <div className="container">
        <Routes>
          <Route path="/" element={<NewsList />} />
          <Route path="/create" element={<NewsForm />} />
          <Route path="/edit/:id" element={<NewsForm />} />
          <Route path="/news/:id" element={<NewsDetail />} />
        </Routes>
      </div>
    </>
  );
}

export default App;