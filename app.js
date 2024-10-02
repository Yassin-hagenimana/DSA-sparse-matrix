const express = require('express');
const SparseMatrix = require('./sparseMatrix.js');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/matrix/operation', (req, res) => {
    const { matrixAFile, matrixBFile, operation } = req.body;

    try {
        if (!matrixAFile || !matrixBFile) {
            return res.status(400).json({ error: 'Matrix file paths are required' });
        }

        const matrixA = new SparseMatrix(matrixAFile);
        const matrixB = new SparseMatrix(matrixBFile);

        let resultMatrix;

        switch (operation.toLowerCase()) {
            case 'add':
                resultMatrix = SparseMatrix.add(matrixA, matrixB);
                break;
            case 'subtract':
                resultMatrix = SparseMatrix.subtract(matrixA, matrixB);
                break;
            case 'multiply':
                resultMatrix = SparseMatrix.multiply(matrixA, matrixB);
                break;
            default:
                return res.status(400).json({ error: 'Invalid operation. Use add, subtract, or multiply.' });
        }

        res.send(resultMatrix.toString());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});