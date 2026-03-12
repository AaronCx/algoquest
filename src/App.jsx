import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BubbleSort from './levels/bubble-sort/BubbleSort.jsx'
import BinarySearch from './levels/binary-search/BinarySearch.jsx'
import BFSMaze from './levels/bfs-maze/BFSMaze.jsx'
import HeapSort from './levels/heap-sort/HeapSort.jsx'
import MergeSort from './levels/merge-sort/MergeSort.jsx'
import QuickSort from './levels/quick-sort/QuickSort.jsx'
import StackPushPop from './levels/stack-push-pop/StackPushPop.jsx'
import LinearSearch from './levels/linear-search/LinearSearch.jsx'
import SelectionSort from './levels/selection-sort/SelectionSort.jsx'
import EuclidGCD from './levels/euclid-gcd/EuclidGCD.jsx'
import FloydCycle from './levels/floyd-cycle/FloydCycle.jsx'
import Dijkstra from './levels/dijkstra/Dijkstra.jsx'
import BSTLevel from './levels/bst/BST.jsx'
import Overworld from './overworld/Overworld.jsx'
import EndingScreen from './overworld/EndingScreen.jsx'
import PlaceholderBattle from './overworld/PlaceholderBattle.jsx'
import Act1Cutscene from './overworld/Act1Cutscene.jsx'
import IntroCutscene from './overworld/IntroCutscene.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"                       element={<Home />} />
      <Route path="/level/bubble-sort"      element={<BubbleSort />} />
      <Route path="/level/binary-search"    element={<BinarySearch />} />
      <Route path="/level/bfs-maze"         element={<BFSMaze />} />
      <Route path="/level/heap-sort"        element={<HeapSort />} />
      <Route path="/level/merge-sort"       element={<MergeSort />} />
      <Route path="/level/quick-sort"       element={<QuickSort />} />
      <Route path="/level/stack-push-pop"   element={<StackPushPop />} />
      <Route path="/level/linear-search"    element={<LinearSearch />} />
      <Route path="/level/selection-sort"   element={<SelectionSort />} />
      <Route path="/level/euclid-gcd"       element={<EuclidGCD />} />
      <Route path="/level/floyd-cycle"      element={<FloydCycle />} />
      <Route path="/level/dijkstra"         element={<Dijkstra />} />
      <Route path="/level/bst"              element={<BSTLevel />} />
      <Route path="/rpg"                    element={<Overworld />} />
      <Route path="/ending"                 element={<EndingScreen />} />
      <Route path="/battle/:battleId"       element={<PlaceholderBattle />} />
      <Route path="/act1cutscene"           element={<Act1Cutscene />} />
      <Route path="/intro"                  element={<IntroCutscene />} />
    </Routes>
  )
}
