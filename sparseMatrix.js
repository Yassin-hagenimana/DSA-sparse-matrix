// sparseMatrix.js
const fs = require('fs');
const prompt = require('prompt-sync')(); // For user input

class SparseMatrix {
    constructor(matrixFilePath = null, numRows = 0, numCols = 0) {
        this.rows = numRows;
        this.cols = numCols;
        this.elements = new Map(); // Stores non-zero values with key 'row,col'

        if (matrixFilePath) {
            this.loadFromFile(matrixFilePath);
        }
    }

    getElement(currRow, currCol) {
        const key = `${currRow},${currCol}`;
        return this.elements.has(key) ? this.elements.get(key) : 0;
    }

    setElement(currRow, currCol, value) {
        const key = `${currRow},${currCol}`;
        if (value !== 0) {
            this.elements.set(key, value);
        } else {
            this.elements.delete(key);
        }
    }

    // Load the sparse matrix from a file
    loadFromFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim());

            for (let line of data) {
                if (line.startsWith('rows=')) {
                    this.rows = parseInt(line.split('=')[1]);
                    if (isNaN(this.rows)) {
                        throw new Error("Invalid number of rows");
                    }
                } else if (line.startsWith('cols=')) {
                    this.cols = parseInt(line.split('=')[1]);
                    if (isNaN(this.cols)) {
                        throw new Error("Invalid number of columns");
                    }
                } else if (line.startsWith('(') && line.endsWith(')')) {
                    const [row, col, value] = line.slice(1, -1).split(',').map(Number);
                    if ([row, col, value].some(num => isNaN(num))) {
                        throw new Error("Input file has wrong format");
                    }
                    this.setElement(row, col, value);
                } else if (line !== '') {
                    // Non-empty line that doesn't match expected formats
                    throw new Error("Input file has wrong format");
                }
            }
        } catch (err) {
            throw new Error(`Error loading matrix from file '${filePath}': ${err.message}`);
        }
    }

    add(otherMatrix) {
        this._validateDimensions(otherMatrix);

        const result = new SparseMatrix(null, this.rows, this.cols);
        this._mergeMatrices(result, otherMatrix, (a, b) => a + b);

        return result;
    }

    subtract(otherMatrix) {
        this._validateDimensions(otherMatrix);

        const result = new SparseMatrix(null, this.rows, this.cols);
        this._mergeMatrices(result, otherMatrix, (a, b) => a - b);

        return result;
    }

    multiply(otherMatrix) {
        if (this.cols !== otherMatrix.rows) {
            throw new Error("Matrix dimensions are not compatible for multiplication");
        }

        const result = new SparseMatrix(null, this.rows, otherMatrix.cols);

        this.elements.forEach((value1, key1) => {
            const [i, k] = key1.split(',').map(Number);
            for (let col = 0; col < otherMatrix.cols; col++) {
                const value2 = otherMatrix.getElement(k, col);
                if (value2 !== 0) {
                    const currentVal = result.getElement(i, col);
                    result.setElement(i, col, currentVal + value1 * value2);
                }
            }
        });

        return result;
    }

    saveToFile(filePath) {
        const output = [`rows=${this.rows}`, `cols=${this.cols}`];

        this.elements.forEach((value, key) => {
            const [row, col] = key.split(',');
            output.push(`(${row}, ${col}, ${value})`);
        });

        fs.writeFileSync(filePath, output.join('\n'), 'utf-8');
    }

    _validateDimensions(otherMatrix) {
        if (this.rows !== otherMatrix.rows || this.cols !== otherMatrix.cols) {
            throw new Error("Matrix dimensions do not match for this operation");
        }
    }

    _mergeMatrices(result, otherMatrix, operation) {
        this.elements.forEach((value, key) => {
            result.elements.set(key, value);
        });

        otherMatrix.elements.forEach((value, key) => {
            const existingValue = result.elements.get(key) || 0;
            const newValue = operation(existingValue, value);
            if (newValue !== 0) {
                result.elements.set(key, newValue);
            } else {
                result.elements.delete(key);
            }
        });
    }
}

// Main function to drive the program
const main = () => {
    try {
        console.log("Select operation:\n1. Addition\n2. Subtraction\n3. Multiplication");
        const choice = prompt("Enter your choice (1, 2, or 3): ");
        const operation = { '1': 'add', '2': 'subtract', '3': 'multiply' }[choice];

        if (!operation) {
            console.error("Invalid choice");
            return;
        }

        const file1 = prompt("Enter the first input file path: ").trim();
        const file2 = prompt("Enter the second input file path: ").trim();

        const matrix1 = new SparseMatrix(file1);
        const matrix2 = new SparseMatrix(file2);

        let result;

        switch (operation) {
            case 'add':
                result = matrix1.add(matrix2);
                break;
            case 'subtract':
                result = matrix1.subtract(matrix2);
                break;
            case 'multiply':
                result = matrix1.multiply(matrix2);
                break;
            default:
                throw new Error("Invalid operation");
        }

        const outputFile = "result.txt";
        result.saveToFile(outputFile);
        console.log(`Operation successful, result saved to ${outputFile}`);
    } catch (error) {
        console.error("Error:", error.message);
    }
};

main();
