class Heap {
    constructor() {
        this.heap = [];
    }

    _leftChild = (index) => index * 2 + 1;
    _rightChild = (index) => index * 2 + 2;
    _parent = (index) => Math.floor((index-1) / 2);

    // определяет сравнение объектов
    lessThan(a, b) {
        return a < b;
    }

    _swap(i, j) {
        const tmp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = tmp;
    }

    _up(i) {
        while (i !== 0 && this.lessThan(this.heap[this._parent(i)], this.heap[i])) {
            this._swap(this._parent(i), i);
            i = this._parent(i);
        }
    }

    _down(i) {
        let heapLen = this.heap.length;
        while (this._leftChild(i) < heapLen) {
            let maxChild = this._leftChild(i);
            if (maxChild + 1 < heapLen && this.lessThan(this.heap[maxChild], this.heap[maxChild+1])) {
                maxChild++;
            }

            if (this.lessThan(this.heap[maxChild], this.heap[i])) {
                break;
            }
            this._swap(i, maxChild);
            i = maxChild;
        }
    }

    top() {
        return this.heap[0];
    }

    add(elem) {
        this.heap.push(elem);
        this._up(this.heap.length-1);
    }

    addElems(elems) {
        for (let i = 0; i < elems.length; ++i) {
            this.add(elems[i]);
        }
    }

    pop() {
        let val = this.heap[0];
        this.heap[0] = this.heap[this.heap.length-1];
        this.heap.pop();
        this._down(0);
        return val;
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}