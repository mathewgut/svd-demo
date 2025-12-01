import { Matrix, SingularValueDecomposition } from 'ml-matrix';

function convertToRGBMatrices(imageData) {
    console.log("converting")
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const rMatrix = [];
    const gMatrix = [];
    const bMatrix = [];

    for (let y = 0; y < height; y++) {
        const rRow = [], gRow = [], bRow = [];
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            rRow.push(data[i]);     
            gRow.push(data[i + 1]); 
            bRow.push(data[i + 2]); 
        }
        rMatrix.push(rRow);
        gMatrix.push(gRow);
        bMatrix.push(bRow);
    }
    
    return { rMatrix, gMatrix, bMatrix };
  }

function Compress (matrix, rank) {
    console.log("compressing")
    const A = new Matrix (matrix);
        
    const SVD = new SingularValueDecomposition(A);

    const s = SVD.diagonal;
    const u = SVD.leftSingularVectors;
    const v = SVD.rightSingularVectors;
    
    // takes in row start, row end, col start, col end 
    const Ur = u.subMatrix(0, u.rows -1, 0, rank -1)
    // slice the slowest values (least important) from the matrix
    const Sr = Matrix.diag(s.slice(0, rank))
    const Vr = v.subMatrix(0, v.rows -1, 0, rank-1);

    return Ur.mmul(Sr).mmul(Vr.transpose());
}

self.onmessage = function(e) {
    console.log("recieved")
    const { pixelData, rank} = e.data;
    const height = pixelData.height;
    const width = pixelData.width;

    try {
        console.log("starting")
        const {rMatrix, gMatrix, bMatrix} =  convertToRGBMatrices(pixelData);

        console.log("starting r")
        const compressedR = Compress(rMatrix, rank);
        console.log("starting g")
        const compressedG = Compress(gMatrix, rank);
        console.log("starting b")
        const compressedB = Compress(bMatrix, rank);

        // easier for js to iterate over
        const rData = compressedR.to2DArray();
        const gData = compressedG.to2DArray();
        const bData = compressedB.to2DArray();

        // compressing each matrix back into a 1d array for canvas to read
        // clamp fixes floating point results with int floor between 0 and 255
        const SVDImage = new Uint8ClampedArray(width*height*4) 
        console.log("flattening")
        for (let y = 0; y < height; y++) {
            const rRow = rData[y];
            const gRow = gData[y];
            const bRow = bData[y];
            
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                // r,g,b,a
                SVDImage[i] = rRow[x]; 
                SVDImage[i + 1] = gRow[x];
                SVDImage[i + 2] = bRow[x];
                SVDImage[i + 3] = 255; // assume alpha full, we don't compress it bc idk internet says so
            }
        }

        self.postMessage({
            success: true,
            pixels:  SVDImage
        }, [SVDImage.buffer]) // buffer uses references rather than passing the whole object (can be huge and break stuff)
    }
    catch (error) {
        self.postMessage({success: false, error: error})
    }
}