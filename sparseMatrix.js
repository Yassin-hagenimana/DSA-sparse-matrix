const fs = require('fs');

class SparseMatrix {
    constructor(matrixFilePath = null, numRows = 0, numCols = 0) {
        this.rows = numRows;
        this.cols = numCols;
        this.elements = new Map(); // (key: 'row,col', value: int)

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
        const data = fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim());

        for (let line of data) {
            if (line.startsWith('rows=')) {
                this.rows = parseInt(line.split('=')[1]);
            } else if (line.startsWith('cols=')) {
                this.cols = parseInt(line.split('=')[1]);
            } else if (line.startsWith('(')) {
                const [row, col, value] = line.replace(/[()]/g, '').split(',').map(Number);
                this.setElement(row, col, value);
            }
        }
    }

    add(otherMatrix) {
        if (this.rows !== otherMatrix.rows || this.cols !== otherMatrix.cols) {
            throw new Error("Matrix dimensions do not match for addition");
        }

        const result = new SparseMatrix(null, this.rows, this.cols);

        this.elements.forEach((value, key) => {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value);
        });

        otherMatrix.elements.forEach((value, key) => {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, result.getElement(row, col) + value);
        });

        return result;
    }

    subtract(otherMatrix) {
        if (this.rows !== otherMatrix.rows || this.cols !== otherMatrix.cols) {
            throw new Error("Matrix dimensions do not match for subtraction");
        }

        const result = new SparseMatrix(null, this.rows, this.cols);

        this.elements.forEach((value, key) => {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value);
        });

        otherMatrix.elements.forEach((value, key) => {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, result.getElement(row, col) - value);
        });

        return result;
    }

    multiply(otherMatrix) {
        if (this.cols !== otherMatrix.rows) {
            throw new Error("Matrix dimensions are not compatible for multiplication");
        }

        const result = new SparseMatrix(null, this.rows, otherMatrix.cols);

        this.elements.forEach((value1, key1) => {
            const [i, k] = key1.split(',').map(Number);
            otherMatrix.elements.forEach((value2, key2) => {
                const [k2, j] = key2.split(',').map(Number);
                if (k === k2) {
                    const currentVal = result.getElement(i, j);
                    result.setElement(i, j, currentVal + value1 * value2);
                }
            });
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
}

// Main function to drive the program
const main = async () => {
    try {
        const prompt = require('prompt-sync')(); // For user input
        console.log("Select operation:\n1. Addition\n2. Subtraction\n3. Multiplication");
        const choice = parseInt(prompt("Enter your choice: "), 10);

        const file1 = prompt("Enter the first input file path: ");
        const file2 = prompt("Enter the second input file path: ");

        const matrix1 = new SparseMatrix(file1);
        const matrix2 = new SparseMatrix(file2);

        let result;

        switch (choice) {
            case 1:
                result = matrix1.add(matrix2);
                break;
            case 2:
                result = matrix1.subtract(matrix2);
                break;
            case 3:
                result = matrix1.multiply(matrix2);
                break;
            default:
                throw new Error("Invalid operation choice");
        }

        const outputFile = 'result.txt';
        result.saveToFile(outputFile);
        console.log(`Result saved to ${outputFile}`);
    } catch (error) {
        console.error("Error:", error.message);
    }
};

main();
