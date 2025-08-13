(function() {
    const visualizerContainer = document.getElementById('visualizer');
    const generateBtn = document.getElementById('generate-array-btn');
    const startBtn = document.getElementById('start-sort-btn');
    const stopBtn = document.getElementById('stop-sort-btn');
    const algorithmSelector = document.getElementById('algorithm-selector');
    const arrayTypeSelector = document.getElementById('array-type-selector');
    const customArrayInput = document.getElementById('custom-array-input');
    const speedRange = document.getElementById('speed-range');
    const speedValueSpan = document.getElementById('speed-value');
    const arraySizeRange = document.getElementById('array-size');
    const arraySizeValueSpan = document.getElementById('array-size-value');
    const messageBox = document.getElementById('message-box');
    const messageContent = document.getElementById('message-content');
    const closeMessageBtn = document.getElementById('close-message-btn');
    const statsPanel = document.getElementById('stats-panel');
    const statAlgorithm = document.getElementById('stat-algorithm');
    const statTimeComplexity = document.getElementById('stat-time-complexity');
    const statSpaceComplexity = document.getElementById('stat-space-complexity');
    const statComparisons = document.getElementById('stat-comparisons');
    const statSwaps = document.getElementById('stat-swaps');
    let array = [];
    let isSorting = false;
    let isStopped = false;
    let currentDelay = 50;
    let currentArraySize = 50;
    let comparisons = 0;
    let swaps = 0;
    let startTime = 0;
    let selectedAlgorithm = 'bubbleSort';

    const algorithmData = {
        bubbleSort: { name: 'Bubble Sort', time: '$O(n^2)$', space: '$O(1)$' },
        selectionSort: { name: 'Selection Sort', time: '$O(n^2)$', space: '$O(1)$' },
        insertionSort: { name: 'Insertion Sort', time: '$O(n^2)$', space: '$O(1)$' },
        quickSort: { name: 'Quick Sort', time: '$O(n \\log n)$', space: '$O(\\log n)$' },
        mergeSort: { name: 'Merge Sort', time: '$O(n \\log n)$', space: '$O(n)$' },
        heapSort: { name: 'Heap Sort', time: '$O(n \\log n)$', space: '$O(1)$' },
        gnomeSort: { name: 'Gnome Sort', time: '$O(n^2)$', space: '$O(1)$' },
        shakerSort: { name: 'Shaker Sort', time: '$O(n^2)$', space: '$O(1)$' },
        oddEvenSort: { name: 'Odd Even Sort', time: '$O(n^2)$', space: '$O(1)$' }
    };

    generateBtn.addEventListener('click', () => {
        if (!isSorting) { handleGenerateArray(); } else { showMessage("A sort is currently in progress. Please wait for it to finish."); }
    });

    startBtn.addEventListener('click', () => {
        if (isSorting) { showMessage("A sort is already running."); return; }
        selectedAlgorithm = algorithmSelector.value;
        if (array.length === 0) { showMessage("Please generate an array first."); return; }
        resetStats(selectedAlgorithm);
        isSorting = true;
        isStopped = false;
        visualizerContainer.style.overflowX = 'auto';
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        generateBtn.disabled = true;
        switch(selectedAlgorithm) {
            case 'bubbleSort': bubbleSort(); break;
            case 'selectionSort': selectionSort(); break;
            case 'insertionSort': insertionSort(); break;
            case 'quickSort': quickSort(0, array.length - 1); break;
            case 'mergeSort': mergeSortWrapper(0, array.length - 1); break;
            case 'heapSort': heapSort(); break;
            case 'gnomeSort': gnomeSort(); break;
            case 'shakerSort': shakerSort(); break;
            case 'oddEvenSort': oddEvenSort(); break;
        }
    });

    stopBtn.addEventListener('click', () => { isStopped = true; resetButtons(); updateVisualization(); });
    speedRange.addEventListener('input', (e) => {
        currentDelay = 101 - e.target.value;
        speedValueSpan.textContent = `${101 - currentDelay} ms delay`;
    });
    arraySizeRange.addEventListener('input', (e) => {
        currentArraySize = e.target.value;
        arraySizeValueSpan.textContent = `${currentArraySize} elements`;
        if (!isSorting && customArrayInput.value === '') { handleGenerateArray(); }
    });
    customArrayInput.addEventListener('input', () => {
        const isCustomInput = customArrayInput.value.trim() !== '';
        arraySizeRange.disabled = isCustomInput;
        arrayTypeSelector.disabled = isCustomInput;
        generateBtn.textContent = isCustomInput ? 'Create Custom Array' : 'Generate New Array';
    });
    closeMessageBtn.addEventListener('click', () => { messageBox.style.display = 'none'; });

    function showMessage(msg) { messageContent.textContent = msg; messageBox.style.display = 'block'; }
    function resetButtons() {
        isSorting = false;
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
        generateBtn.disabled = false;
    }
    const sleep = (ms) => new Promise((resolve, reject) => {
        const checkStop = () => {
            if (isStopped) { reject(new Error("Sort stopped by user")); } else { setTimeout(resolve, ms); }
        };
        checkStop();
    });
    function generateArrayAndVisualize(dataArray) {
        array = [...dataArray];
        const maxBarHeight = visualizerContainer.clientHeight * 0.9;
        const minBarHeight = 10;
        const arraySize = array.length;
        const availableWidth = visualizerContainer.clientWidth - (arraySize * 2);
        const barWidth = Math.floor(availableWidth / arraySize);
        visualizerContainer.innerHTML = '';
        const maxValue = Math.max(...array);
        const scaleFactor = maxValue > 0 ? (maxBarHeight / maxValue) : 1;
        for (let i = 0; i < arraySize; i++) {
            const value = array[i];
            const scaledValue = Math.max(minBarHeight, value * scaleFactor);
            const bar = document.createElement('div');
            bar.classList.add('bar', 'transition-all', 'duration-100');
            bar.style.height = `${scaledValue}px`;
            bar.style.width = `${barWidth}px`;
            bar.style.margin = `0 1px`;
            visualizerContainer.appendChild(bar);
        }
    }
    function handleGenerateArray() {
        const customInput = customArrayInput.value.trim();
        let newArray = [];
        if (customInput !== '') {
            const values = customInput.split(',').map(item => parseInt(item.trim(), 10));
            const validValues = values.filter(val => !isNaN(val) && val > 0);
            if (validValues.length === 0) { showMessage('Please enter valid positive numbers, separated by commas.'); return; }
            if (validValues.length > 200) { showMessage('The maximum number of elements is 200. Please reduce your list size.'); return; }
            newArray = validValues;
            currentArraySize = newArray.length;
        } else {
            const arrayType = arrayTypeSelector.value;
            const maxBarHeight = visualizerContainer.clientHeight * 0.9;
            const minBarHeight = 10;
            for (let i = 0; i < currentArraySize; i++) {
                newArray.push(Math.floor(Math.random() * (maxBarHeight - minBarHeight)) + minBarHeight);
            }
            if (arrayType === 'sorted') { newArray.sort((a, b) => a - b); }
            else if (arrayType === 'reversed') { newArray.sort((a, b) => b - a); }
            else if (arrayType === 'nearly-sorted') {
                newArray.sort((a, b) => a - b);
                const numSwaps = Math.floor(currentArraySize * 0.05);
                for (let i = 0; i < numSwaps; i++) {
                    const idx1 = Math.floor(Math.random() * currentArraySize);
                    const idx2 = Math.floor(Math.random() * currentArraySize);
                    [newArray[idx1], newArray[idx2]] = [newArray[idx2], newArray[idx1]];
                }
            }
        }
        generateArrayAndVisualize(newArray);
    }
    function updateVisualization(indicesToHighlight = [], color = '#3b82f6') {
        const bars = visualizerContainer.children;
        for (let i = 0; i < bars.length; i++) { bars[i].style.backgroundColor = '#3b82f6'; }
        for (let index of indicesToHighlight) { if (bars[index]) { bars[index].style.backgroundColor = color; } }
    }
    function markSorted(index) { const bars = visualizerContainer.children; if (bars[index]) { bars[index].style.backgroundColor = '#10b981'; } }
    function markAllSorted() { const bars = visualizerContainer.children; for (let i = 0; i < bars.length; i++) { bars[i].style.backgroundColor = '#10b981'; } }
    async function swap(index1, index2) {
        swaps++; statSwaps.textContent = swaps;
        const bars = visualizerContainer.children;
        const tempHeight = bars[index1].style.height;
        bars[index1].style.height = bars[index2].style.height;
        bars[index2].style.height = tempHeight;
        const tempValue = array[index1];
        array[index1] = array[index2];
        array[index2] = tempValue;
        await sleep(currentDelay);
    }
    function finishSort() {
        isSorting = false;
        startBtn.disabled = false;
        generateBtn.disabled = false;
        markAllSorted();
        visualizerContainer.style.overflowX = 'hidden';
        const endTime = performance.now();
        const totalTime = (endTime - startTime).toFixed(2);
        statComparisons.textContent += ` (${totalTime} ms)`;
        resetButtons();
    }
    function resetStats(algorithm) {
        comparisons = 0; swaps = 0; startTime = performance.now();
        const selectedData = algorithmData[algorithm];
        statsPanel.classList.remove('hidden');
        statAlgorithm.textContent = selectedData.name;
        statTimeComplexity.textContent = selectedData.time;
        statSpaceComplexity.textContent = selectedData.space;
        statComparisons.textContent = '0'; statSwaps.textContent = '0';
    }
    async function bubbleSort() {
        try {
            let swapped;
            do {
                swapped = false;
                for (let i = 0; i < array.length - 1; i++) {
                    comparisons++; statComparisons.textContent = comparisons;
                    updateVisualization([i, i + 1], '#ef4444'); await sleep(currentDelay);
                    if (array[i] > array[i + 1]) { await swap(i, i + 1); swapped = true; }
                    updateVisualization();
                }
                markSorted(array.length - 1);
            } while (swapped);
            finishSort();
        } catch (e) { console.error(e.message); }
    }
    async function selectionSort() {
        try {
            for (let i = 0; i < array.length - 1; i++) {
                let minIndex = i; updateVisualization([i], '#f97316');
                for (let j = i + 1; j < array.length; j++) {
                    comparisons++; statComparisons.textContent = comparisons;
                    updateVisualization([i, j], '#ef4444'); await sleep(currentDelay);
                    if (array[j] < array[minIndex]) {
                        if (minIndex !== i) { visualizerContainer.children[minIndex].style.backgroundColor = '#3b82f6'; }
                        minIndex = j;
                        visualizerContainer.children[minIndex].style.backgroundColor = '#f97316';
                    }
                }
                if (minIndex !== i) { await swap(i, minIndex); }
                markSorted(i);
            }
            markSorted(array.length - 1); finishSort();
        } catch (e) { console.error(e.message); }
    }
    async function insertionSort() {
        try {
            for (let i = 1; i < array.length; i++) {
                let key = array[i]; let j = i - 1;
                let bars = visualizerContainer.children;
                bars[i].style.backgroundColor = '#f97316'; await sleep(currentDelay);
                while (j >= 0 && array[j] > key) {
                    comparisons++; statComparisons.textContent = comparisons;
                    updateVisualization([j, j+1], '#ef4444'); await sleep(currentDelay);
                    await swap(j, j+1); j = j - 1;
                }
                updateVisualization(); markSorted(i);
            }
            finishSort();
        } catch (e) { console.error(e.message); }
    }
    async function quickSort(low, high) {
        try {
            if (low < high) {
                const partitionIndex = await partition(low, high);
                await quickSort(low, partitionIndex - 1);
                await quickSort(partitionIndex + 1, high);
            }
            if (low >= 0 && high < array.length) { markSorted(low); markSorted(high); }
            if (low === 0 && high === array.length - 1) { finishSort(); }
        } catch (e) { console.error(e.message); }
    }
    async function partition(low, high) {
        const bars = visualizerContainer.children; const pivotIndex = high; const pivotValue = array[pivotIndex];
        bars[pivotIndex].style.backgroundColor = '#8b5cf6'; let i = low - 1;
        for (let j = low; j < high; j++) {
            comparisons++; statComparisons.textContent = comparisons;
            bars[j].style.backgroundColor = '#ef4444'; await sleep(currentDelay);
            if (array[j] < pivotValue) {
                i++; await swap(i, j);
                bars[i].style.backgroundColor = '#f97316'; bars[j].style.backgroundColor = '#3b82f6';
            } else { bars[j].style.backgroundColor = '#3b82f6'; }
        }
        await swap(i + 1, high); updateVisualization(); return i + 1;
    }
    async function mergeSort(left, mid, right) {
        const bars = visualizerContainer.children;
        for (let i = left; i <= right; i++) { bars[i].style.backgroundColor = '#8b5cf6'; } await sleep(currentDelay * 2);
        const n1 = mid - left + 1; const n2 = right - mid;
        const leftArray = new Array(n1); const rightArray = new Array(n2);
        for (let i = 0; i < n1; i++) { leftArray[i] = array[left + i]; }
        for (let i = 0; i < n2; i++) { rightArray[i] = array[mid + 1 + i]; }
        let i = 0; let j = 0; let k = left;
        while (i < n1 && j < n2) {
            comparisons++; statComparisons.textContent = comparisons;
            if (leftArray[i] <= rightArray[j]) {
                bars[k].style.backgroundColor = '#ef4444'; await sleep(currentDelay);
                array[k] = leftArray[i]; bars[k].style.height = `${array[k]}px`; i++;
            } else {
                bars[k].style.backgroundColor = '#ef4444'; await sleep(currentDelay);
                array[k] = rightArray[j]; bars[k].style.height = `${array[k]}px`; j++;
            }
            bars[k].style.backgroundColor = '#3b82f6'; k++;
        }
        while (i < n1) { array[k] = leftArray[i]; bars[k].style.height = `${array[k]}px`; i++; k++; }
        while (j < n2) { array[k] = rightArray[j]; bars[k].style.height = `${array[k]}px`; j++; k++; }
    }
    async function heapSort() {
        let n = array.length;
        try {
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) { await heapify(n, i); }
            for (let i = n - 1; i > 0; i--) {
                updateVisualization([0, i], '#ef4444'); await sleep(currentDelay);
                await swap(0, i); updateVisualization(); markSorted(i); await heapify(i, 0);
            }
            markSorted(0); finishSort();
        } catch (e) { console.error(e.message); }
    }
    async function heapify(n, i) {
        let largest = i; let left = 2 * i + 1; let right = 2 * i + 2;
        if (left < n && array[left] > array[largest]) { largest = left; }
        if (right < n && array[right] > array[largest]) { largest = right; }
        if (largest !== i) {
            updateVisualization([i, largest], '#f97316'); await sleep(currentDelay);
            await swap(i, largest); updateVisualization(); await heapify(n, largest);
        }
    }
    async function gnomeSort() {
        try {
            let index = 0;
            while (index < array.length) {
                if (index === 0) { index++; }
                comparisons++; statComparisons.textContent = comparisons;
                if (array[index] >= array[index - 1]) {
                    updateVisualization([index - 1, index], '#10b981'); await sleep(currentDelay); index++;
                } else {
                    updateVisualization([index - 1, index], '#ef4444'); await sleep(currentDelay);
                    await swap(index, index - 1); index--;
                }
                updateVisualization();
            }
            finishSort();
        } catch (e) { console.error(e.message); }
    }
    async function shakerSort() {
        try {
            let swapped;
            do {
                swapped = false;
                for (let i = 0; i < array.length - 1; i++) {
                    comparisons++; statComparisons.textContent = comparisons;
                    updateVisualization([i, i + 1], '#ef4444'); await sleep(currentDelay);
                    if (array[i] > array[i + 1]) { await swap(i, i + 1); swapped = true; }
                    updateVisualization();
                }
                if (!swapped) break;
                swapped = false;
                for (let i = array.length - 2; i >= 0; i--) {
                    comparisons++; statComparisons.textContent = comparisons;
                    updateVisualization([i, i + 1], '#ef4444'); await sleep(currentDelay);
                    if (array[i] > array[i + 1]) { await swap(i, i + 1); swapped = true; }
                    updateVisualization();
                }
            } while (swapped);
            finishSort();
        } catch (e) { console.error(e.message); }
    }
    async function oddEvenSort() {
        try {
            let sorted = false;
            while (!sorted) {
                sorted = true;
                for (let i = 1; i < array.length - 1; i += 2) {
                    comparisons++; statComparisons.textContent = comparisons;
                    updateVisualization([i, i + 1], '#ef4444'); await sleep(currentDelay);
                    if (array[i] > array[i + 1]) { await swap(i, i + 1); sorted = false; }
                    updateVisualization();
                }
                for (let i = 0; i < array.length - 1; i += 2) {
                    comparisons++; statComparisons.textContent = comparisons;
                    updateVisualization([i, i + 1], '#ef4444'); await sleep(currentDelay);
                    if (array[i] > array[i + 1]) { await swap(i, i + 1); sorted = false; }
                    updateVisualization();
                }
            }
            finishSort();
        } catch (e) { console.error(e.message); }
    }
    async function mergeSortWrapper(left, right) {
        try {
            if (left >= right) { return; }
            const mid = left + Math.floor((right - left) / 2);
            await mergeSortWrapper(left, mid);
            await mergeSortWrapper(mid + 1, right);
            await mergeSort(left, mid, right);
            if (left === 0 && right === array.length - 1) { finishSort(); }
        } catch (e) { console.error(e.message); }
    }
    window.onload = () => {
        handleGenerateArray();
        const selectedData = algorithmData[algorithmSelector.value];
        statsPanel.classList.remove('hidden');
        statAlgorithm.textContent = selectedData.name;
        statTimeComplexity.textContent = selectedData.time;
        statSpaceComplexity.textContent = selectedData.space;
        document.getElementById('start-sort-btn').addEventListener('click', () => {
            const selectedAlgorithm = algorithmSelector.value;
            if (selectedAlgorithm === 'mergeSort') {
                mergeSortWrapper(0, array.length - 1);
            } else if (selectedAlgorithm === 'quickSort') {
                quickSort(0, array.length - 1);
            } else {
                window[selectedAlgorithm]();
            }
        });
    };
})();
