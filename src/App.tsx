import { Navigate, Route, Routes, useParams } from 'react-router-dom';

function LearningRoute() {
  const { setId } = useParams();
  const setNumber = Number(setId?.replace('set-', '')) || 1;
  return <main><h1>เรียน Set {setNumber}</h1></main>;
}

function HomeRoute() {
  return <main><h1>HSK Mission</h1></main>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/learn/:setId" element={<LearningRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
