import { Routes, Route } from 'react-router-dom';
import { Home } from '@/Pages/Home';
<<<<<<< HEAD
=======
import { FormsPage } from '@/Pages/Forms';
>>>>>>> a7a628a (UI update)
import { NotFound } from '@/Pages/NotFound';

function App() {
  return (
    <div>
<<<<<<< HEAD
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
=======
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/forms" element={<FormsPage />} />
    <Route path="*" element={<NotFound />} />
    </Routes>
>>>>>>> a7a628a (UI update)
    </div>
  );
}

export default App;
