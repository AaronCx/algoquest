// ── Unit tests for core algorithm logic ─────────────────────────────────────

// ── Bubble Sort ─────────────────────────────────────────────────────────────
function bubbleSort(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i >= 1; i--) {
    for (let j = 0; j < i; j++) {
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
      }
    }
  }
  return a
}

describe('Bubble Sort', () => {
  it('sorts a shuffled array', () => {
    expect(bubbleSort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5])
  })

  it('handles already sorted array', () => {
    expect(bubbleSort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles single element', () => {
    expect(bubbleSort([7])).toEqual([7])
  })

  it('handles empty array', () => {
    expect(bubbleSort([])).toEqual([])
  })

  it('handles duplicates', () => {
    expect(bubbleSort([3, 1, 3, 2, 1])).toEqual([1, 1, 2, 3, 3])
  })

  it('handles reverse-sorted array', () => {
    expect(bubbleSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })
})

// ── Binary Search ───────────────────────────────────────────────────────────
function binarySearch(arr, target) {
  let low = 0
  let high = arr.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) low = mid + 1
    else high = mid - 1
  }
  return -1
}

describe('Binary Search', () => {
  it('finds element in sorted array', () => {
    expect(binarySearch([1, 3, 5, 7, 9, 11], 7)).toBe(3)
  })

  it('finds first element', () => {
    expect(binarySearch([1, 3, 5, 7, 9], 1)).toBe(0)
  })

  it('finds last element', () => {
    expect(binarySearch([1, 3, 5, 7, 9], 9)).toBe(4)
  })

  it('returns -1 for missing element', () => {
    expect(binarySearch([1, 3, 5, 7, 9], 4)).toBe(-1)
  })

  it('handles single element found', () => {
    expect(binarySearch([5], 5)).toBe(0)
  })

  it('handles single element not found', () => {
    expect(binarySearch([5], 3)).toBe(-1)
  })

  it('handles empty array', () => {
    expect(binarySearch([], 1)).toBe(-1)
  })
})

// ── Merge Sort (merge step) ────────────────────────────────────────────────
function merge(left, right) {
  const result = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  while (i < left.length) result.push(left[i++])
  while (j < right.length) result.push(right[j++])
  return result
}

function mergeSort(arr) {
  if (arr.length <= 1) return [...arr]
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}

describe('Merge Sort', () => {
  it('merges two sorted arrays', () => {
    expect(merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('merges when one array is empty', () => {
    expect(merge([], [1, 2, 3])).toEqual([1, 2, 3])
    expect(merge([1, 2, 3], [])).toEqual([1, 2, 3])
  })

  it('merges arrays with duplicates', () => {
    expect(merge([1, 3, 3], [2, 3, 4])).toEqual([1, 2, 3, 3, 3, 4])
  })

  it('sorts a shuffled array via full merge sort', () => {
    expect(mergeSort([5, 3, 8, 1, 9, 2, 7])).toEqual([1, 2, 3, 5, 7, 8, 9])
  })

  it('sorts single element', () => {
    expect(mergeSort([42])).toEqual([42])
  })

  it('sorts empty array', () => {
    expect(mergeSort([])).toEqual([])
  })
})

// ── Quick Sort (partition logic) ────────────────────────────────────────────
function partition(arr, lo, hi) {
  const pivot = arr[hi]
  let i = lo
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
  return i
}

function quickSort(arr) {
  const a = [...arr]
  function qs(lo, hi) {
    if (lo < hi) {
      const p = partition(a, lo, hi)
      qs(lo, p - 1)
      qs(p + 1, hi)
    }
  }
  qs(0, a.length - 1)
  return a
}

describe('Quick Sort — partition', () => {
  it('partitions so pivot is in correct position', () => {
    const arr = [3, 6, 1, 8, 2, 5]
    const pivotIdx = partition(arr, 0, arr.length - 1)
    // pivot value was 5 (last element)
    expect(arr[pivotIdx]).toBe(5)
    // everything left of pivot <= 5
    for (let i = 0; i < pivotIdx; i++) {
      expect(arr[i]).toBeLessThanOrEqual(5)
    }
    // everything right of pivot > 5
    for (let i = pivotIdx + 1; i < arr.length; i++) {
      expect(arr[i]).toBeGreaterThan(5)
    }
  })

  it('handles partition of two elements', () => {
    const arr = [2, 1]
    const p = partition(arr, 0, 1)
    expect(arr[p]).toBe(1)
  })

  it('full quick sort produces sorted array', () => {
    expect(quickSort([10, 7, 3, 1, 8, 6, 2, 9, 5, 4])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('quick sort handles duplicates', () => {
    expect(quickSort([3, 1, 2, 3, 1])).toEqual([1, 1, 2, 3, 3])
  })
})

// ── Heap Sort (heapify logic) ───────────────────────────────────────────────
function heapify(arr, n, i) {
  let largest = i
  const left = 2 * i + 1
  const right = 2 * i + 2
  if (left < n && arr[left] > arr[largest]) largest = left
  if (right < n && arr[right] > arr[largest]) largest = right
  if (largest !== i) {
    ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
    heapify(arr, n, largest)
  }
}

function heapSort(arr) {
  const a = [...arr]
  const n = a.length
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(a, n, i)
  }
  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    ;[a[0], a[i]] = [a[i], a[0]]
    heapify(a, i, 0)
  }
  return a
}

describe('Heap Sort — heapify', () => {
  it('heapify fixes a single violation at root', () => {
    // max-heap with violation at root: root=1 but children are 5,3
    const arr = [1, 5, 3]
    heapify(arr, arr.length, 0)
    expect(arr[0]).toBe(5) // largest should bubble to root
  })

  it('heapify cascades down', () => {
    const arr = [1, 5, 3, 7, 4]
    heapify(arr, arr.length, 0)
    // Root should be 5 or 7 (whichever is largest reachable)
    expect(arr[0]).toBe(5)
  })

  it('full heap sort produces sorted array', () => {
    expect(heapSort([4, 10, 3, 5, 1])).toEqual([1, 3, 4, 5, 10])
  })

  it('heap sort handles already sorted', () => {
    expect(heapSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('heap sort handles reverse sorted', () => {
    expect(heapSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('heap sort handles single element', () => {
    expect(heapSort([9])).toEqual([9])
  })
})
