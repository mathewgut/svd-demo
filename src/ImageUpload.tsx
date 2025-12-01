import { useEffect, useRef, useState } from "react";

const svdWorker = new Worker(new URL("SVDWorker.js", import.meta.url), { type: "module" });

const UploadAndDisplayImage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<boolean | null>(null);
  const [rank, setRank] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    svdWorker.onmessage = (e) => {
      if (e.data.success && canvasRef.current && outputCanvasRef.current) {
        const ctx = outputCanvasRef.current.getContext("2d");
        
        setIsLoading(false);
        setSuccess(true);
        
        if (ctx) {
          console.log("success")
          drawToCanvas(ctx, e.data.pixels);
        }
      } else {
        setIsLoading(false);
        setError(true);
        console.error(e.data.error);
      }
    };

    return () => {
        svdWorker.onmessage = null; 
    };
  }, []);

  const handleCompress = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    setSuccess(false);
    setError(false);
    setIsLoading(true);

    const imageData = ctx?.getImageData(0, 0, width, height);
    

    if (imageData) {
        svdWorker.postMessage({
            pixelData: imageData,
            width,
            height,
            rank
        }, [imageData.data.buffer]); 
    }
  };

  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        if (canvasRef.current && outputCanvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          outputCanvasRef.current.width = img.width;
          outputCanvasRef.current.height = img.height;

          ctx?.drawImage(img, 0, 0);
          
          setSuccess(false); 
          setError(false);
        }
      };
      
      img.src = URL.createObjectURL(selectedImage);
    }
  }, [selectedImage]);

  function drawToCanvas(ctx: CanvasRenderingContext2D, newPixelData: ImageData["data"]) {
    if (outputCanvasRef.current && canvasRef.current) {
      
      const newImageData = new ImageData(
        newPixelData,
        canvasRef.current.width,
        canvasRef.current.height
      );

      ctx.putImageData(newImageData, 0, 0);
    }
  }

  const getMaxRank = () => {
    if (!canvasRef.current) return 100;
    const { width, height } = canvasRef.current;
    return Math.min(width, height);
};

  return (
    <main className="flex flex-col justify-center items-center w-full h-full min-h-200 gap-4 py-10">
      <h1 className="text-5xl font-semibold mb-4">SVD Image Compressor</h1>

      {selectedImage && (
        <div className="flex flex-col justify-center items-center gap-4">
          
          <section className="flex-col md:flex-row flex gap-4 max-w-full">
            <canvas 
              ref={canvasRef} 
              className="border border-gray-300 shadow-lg max-w-[80vw] max-h-[60vh]"
            />

            <canvas 
              ref={outputCanvasRef} 
              className="border border-red-600-300 shadow-lg max-w-[80vw] max-h-[60vh]"
            />
          </section>
          

          <div className="flex gap-4">
            <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                onClick={handleCompress}
                disabled={isLoading}
            >
                {isLoading ? "Compressing..." : "Compress Image"}
            </button>
            
            <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setSelectedImage(null)}
            >
                Remove
            </button>
            
          </div>
          
          <div className="flex gap-2">
            <p>1</p>
            <div className="flex flex-col items-center">
              <input 
                type="range" 
                min="1" 
                max={getMaxRank()}
                value={rank} 
                onChange={(e) => setRank(parseInt(e.target.value))} 
              />
              <p>{rank}</p>
          </div>
          <p>{getMaxRank()}</p>
          </div>
        </div>
      )}

      {!selectedImage && (
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              if (event.target.files && event.target.files[0]) {
                setSelectedImage(event.target.files[0]);
              }
            }}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-700 hover:file:cursor-pointer hover:file:text-violet-100 ease-in-out duration-200"
          />
      )}

      {error && <p className="text-red-500">Error processing image.</p>}
      {success && <p className="text-green-600 font-bold">Compression Complete!</p>}
      <section className="flex flex-col gap-4 max-w-2/3">
        <div className="flex flex-col leading-6">
          <h2 className="text-2xl mt-10 mb-1 font-semibold">
            Whats happening?
          </h2>
          <p className="mb-2">
            SVD or Singular Value Decompisition is a generalized, more flexible version of EVD or Eigenvalue Decomposition. EVD only applies to square matrices while SVD can be applied to a matrix of any dimension.
            Images are rarely perfectly square, which makes SVD a great choice for image compression.
          </p>
          <p className="mb-2">
            When you input an image into the compressor, it is broken up into 3 sequentially transformed matrices. <b>V</b>, <b>S</b>, and <b>U</b>. By changing the compression value (<b>rank</b>) with the slider you are removing the least important data in the <b>S</b> matrix. Some refer to this as "noise".
          </p>
          <p className="mb-2">
           The higher the rank, the more data is included in the output matrix, the lower the rank the less detailed the data.
          </p>
        </div>
        <div className="flex flex-col gap-2 leading-6">
          <h3 className="text-xl font-semibold">How it works</h3>
          <p>SVD breaks matrices up into 3 <b>new</b> matrices. This part breaks my brain a bit, so bear with me.</p>
          <ol className="flex flex-col gap-4">
            <li className="text-xl font-semibold">
              V <span className="text-base font-normal">: Maps the input of the data and rotates it so it becomes orthogonal (a right angle) along the x and y axis. This prepares it for <b>S</b>.</span>
            </li>
            <li className="text-xl font-semibold">
              S <span className="text-base font-normal">: This is the perserved "data" stored in a diagonal matrix where the top left is the most important data (light vs dark, general shapes, etc) and the bottom right is the least important data (unique pixels, small features, etc). 
                <b>S</b> intakes <b>V</b> and stretches or shrinks it it along the coordinate axes (x,y). It only keeps the amount of rows/columns of the rank (rank of 3 would be 3 total values, 5 would be 5 total values, etc). </span>
            </li>
             <li className="text-xl font-semibold">
              U <span className="text-base font-normal">: Like <b>V</b>, <b>U</b> takes the matrix from <b>S</b> and rotates it yet again so it ends up facing the correct direction.</span>
            </li>
          </ol>
          <p>In essence the order is rotate, scale (minus rank), rotate. By adjusting rank we can cut out 'noise' and get a more targeted matrix with the most important patterns.</p>
          <p>SVD calculations are O(n). Meaning the amount of time is proportional to the amount of data. An RGB image is O(n^3) as it needs to do a seperate SVD transform for each colour, then we recombine them.</p>
          
        </div>


      </section>
    </main>
  );
};

export default UploadAndDisplayImage;