'use strict';

const gridSize = 9;
const grids = [{
    name: 'empty',
    grid: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
}, {
    name: 'very easy',
    grid: ['', '', '', '', '7', '', '', '4', '', '', '', '4', '2', '', '8', '', '5', '6', '', '', '1', '6', '', '5', '', '', '', '', '9', '5', '8', '', '', '', '', '1', '1', '4', '', '', '2', '', '', '9', '8', '2', '', '', '', '', '9', '4', '6', '', '', '', '', '3', '', '2', '6', '', '', '3', '8', '', '1', '', '6', '7', '', '', '', '1', '', '', '9', '', '', '', '']
}, {
    name: 'easy',
    grid: ['9', '', '', '', '6', '', '', '', '4', '', '5', '', '', '1', '2', '8', '9', '', '', '4', '', '', '', '9', '2', '', '', '', '', '', '', '5', '6', '', '2', '', '6', '', '', '', '', '', '', '', '3', '', '3', '', '1', '9', '', '', '', '', '', '', '4', '9', '', '', '', '1', '', '', '2', '3', '7', '4', '', '', '5', '', '1', '', '', '', '2', '', '', '', '8']
}, {
    name: 'medium',
    grid: ['6', '', '', '', '1', '', '', '', '5', '', '', '', '', '', '', '6', '', '1', '', '', '', '6', '', '', '3', '4', '', '', '1', '', '5', '', '3', '', '', '4', '', '', '7', '', '', '', '2', '', '', '9', '', '', '1', '', '2', '', '7', '', '', '8', '9', '', '', '6', '', '', '', '5', '', '3', '', '', '', '', '', '', '2', '', '', '', '4', '', '', '', '7']
}, {
    name: 'hard',
    grid: ['', '', '', '', '4', '', '2', '3', '', '4', '6', '', '2', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '5', '', '', '7', '', '2', '', '', '3', '', '', '', '', '7', '', '', '', '', '6', '', '', '', '4', '', '9', '7', '', '', '', '', '1', '', '', '3', '', '1', '', '', '6', '', '8', '', '', '', '', '', '5', '8', '', '', '1', '']
}];

Vue.component('sudoku-cell', {
    props: {
        grid: Array,
        grid_size: Number,
        index: Number,
        values: Array,
        auto_fill: Boolean,
        frozen: Boolean,
    },
    computed: {
      /* logical state */
        value: function() {
            return this.grid[this.index];
        },
        allValues: function() {
            let arr = (this.values || []).slice();

            for (let x = arr.length; x < this.grid_size; x++) {
                arr.push((x + 1).toString());
            }
            return arr;
        },
        x: function() {
            return this.index % this.grid_size;
        },
        y: function() {
            return Math.floor(this.index / this.grid_size);
        },
        /**
         * compute the number of cell offset to add to find similar square cells
         */
        sqOffset: function() {
            return {
                x: Math.floor(this.x / 3) * 3,
                y: Math.floor(this.y / 3) * 3
            };
        },
        title: function() {
            return this.frozen ? '' : this.possibleValues.join(', ');
        },
        isValid: function() {
            if (this.frozen) {
                return true;
            }
            if (this.value === '') {
                return this.possibleValues.length > 0;
            }
            /* check line */
            for (let x = 0; x < this.grid_size; x++) {
                if (this.getValue(x, this.y) === this.value) {
                    return false;
                }
            }
            /* check column */
            for (let y = 0; y < this.grid_size; y++) {
                if (this.getValue(this.x, y) === this.value) {
                    return false;
                }
            }
            /* check square */
            for (let x = 0; x < this.grid_size / 3; x++) {
                for (let y = 0; y < this.grid_size / 3; y++) {
                    if (this.getValue(x + this.sqOffset.x, y + this.sqOffset.y) === this.value) {
                        return false;
                    }
                }
            }
            
            return true;
        },
        possibleValues: function() {
            if (this.value !== '') {
                return [];
            }
            const possible = new Set(this.allValues);

            /* check line */
            for (let x = 0; x < this.grid_size; x++) {
                possible.delete(this.getValue(x, this.y));
            }
            if (possible.size === 0) { return []; }

            /* check column */
            for (let y = 0; y < this.grid_size; y++) {
                possible.delete(this.getValue(this.x, y));
            }
            if (possible.size === 0) { return []; }

            /* check square */
            for (let x = 0; x < this.grid_size / 3; x++) {
                for (let y = 0; y < this.grid_size / 3; y++) {
                    possible.delete(this.getValue(x + this.sqOffset.x, y + this.sqOffset.y));
                }
            }

            if (this.auto_fill && possible.size === 1) {
                this.$emit('change', this.index, Array.from(possible)[0]);
            }

            return Array.from(possible);
        },
        /* css states */
        leftBorder: function () {
            return this.x % 3 === 0;
        },
        rightBorder: function () {
            return this.x % 3 === 2;
        },
        topBorder: function () {
            return this.y % 3 === 0;
        },
        bottomBorder: function () {
            return this.y % 3 === 2;
        },
        classNames: function () {
            return {
                cell: true,
                'frozen': this.frozen,
                'is-valid': !this.frozen && this.isValid && !!this.value,
                'is-error': !this.frozen && !this.isValid,
                'left-border': this.leftBorder,
                'right-border': this.rightBorder,
                'bottom-border': this.bottomBorder,
                'top-border': this.topBorder
            };
        },
    },
    methods: {
        change: function(event) {
            let value = event.currentTarget.value;

            if (value !== '') {
                /* retrieve last character */
                value = value.slice(-1);
            }

            if (value !== this.value) {
                this.$emit('change', this.index, value);
            }
        },
        getValue(x, y) {
            /* ignore itself */
            if (x === this.x && y === this.y) {
                return '';
            }
            return this.grid[x + y * this.grid_size];
        }
    },
    template: `
        <span v-if="frozen"
            :class="classNames"
        >
            {{value}}
        </span>
        <input v-else
            type="text"
            :class="classNames"
            :value="value"
            :title="title"
            @input="change"
        >
    `
});

const sudoku = Vue.component('sudoku-grid', {
    props: {
        grid_size: Number,
        auto_fill: Boolean,
        grid: Array
    },
    data: function() {
        return {
            gridState: this.updateGrid(true)
        };
    },
    methods: {
        change: function(index, value) {
            Vue.set(this.gridState, index, value);
        },
        updateGrid: function(init) {
            const grid = [];

            for (let y = 0; y < this.grid_size; y++) {
                for (let x = 0; x < this.grid_size; x++) {
                    const index = x + y * this.grid_size;
                    grid[index] = this.grid[index] || '';
                }
            }

            if (init) {
                return grid;
            } else {
                this.gridState = grid;
            }
        },
        isFrozen: function(index) {
            return !!this.grid[index];
        }
    },
    watch: {
        grid: function() {
            this.updateGrid();
        }
    },
    template: `
        <div class="sudoku">
            <sudoku-cell
                v-for="(value, index) of gridState"
                :index="index"
                :grid="gridState"
                :grid_size="grid_size"
                :auto_fill="auto_fill"
                :frozen="isFrozen(index)"
                @change="change"
                :key="'Cell-' + index"
            ></sudoku-cell>
        </div>`
});

const app = new Vue({
    el: '.app',
    data: {
        auto_fill: true,
        grid_size: gridSize,
        grid: [],
        gridSave: [],
        grids: grids
    },
    methods: {
        save: function() {
            this.gridSave.push(this.$refs.sudoku.gridState.slice());
        },
        restore: function(index) {
            this.grid = this.gridSave[index];
        },
        changeSelection: function(evt) {
            const value = evt.currentTarget.value;
            const grid = this.grids.find((g) => g.name === value);

            if (grid) {
                this.grid = grid.grid;
            }
        }
    }
});
