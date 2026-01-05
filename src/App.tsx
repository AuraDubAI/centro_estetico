import { Routes, Route } from 'react-router-dom';
import { Home } from '@/Pages/Home';
import { About } from '@/Pages/About';
import { NotFound } from '@/Pages/NotFound';
import { Stopwatch } from '@/Pages/Stopwatch';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
