import { Routes, Route } from 'react-router-dom';
import { Home } from '@/Pages/Home';
import { FormsPage } from '@/Pages/Forms';
import { NotFound } from '@/Pages/NotFound';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
