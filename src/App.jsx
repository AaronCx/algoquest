import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BubbleSort from './levels/bubble-sort/BubbleSort.jsx'
import BinarySearch from './levels/binary-search/BinarySearch.jsx'
import BFSMaze from './levels/bfs-maze/BFSMaze.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"                    element={<Home />} />
      <Route path="/level/bubble-sort"   element={<BubbleSort />} />
      <Route path="/level/binary-search" element={<BinarySearch />} />
      <Route path="/level/bfs-maze"      element={<BFSMaze />} />
    </Routes>
  )
}
