import { useEffect, useRef, useState } from "react";

const UploadAndDisplayImage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const canvas = useRef(null);

  useEffect(() => {
    if (selectedImage && canvas.current) {
      const ctx = (canvas.current as HTMLCanvasElement).getContext("2d");
      const img = new Image();
      img.onload = () => {
        if (canvas.current) {
          (canvas.current as HTMLCanvasElement).width = img.width;
          (canvas.current as HTMLCanvasElement).height = img.height;
        }
        ctx?.drawImage(img, 0, 0);
      };
      img.src = URL.createObjectURL(selectedImage);
    }
  }, [selectedImage]);

  return (
    <div>
      <h1>Upload and Display Image</h1>
      <h3>using React Hooks</h3>

      {/* Conditionally render the selected image if it exists */}
      {selectedImage && (
        <div>
          {/* display image using canvas to parse image data */}
          <canvas ref={canvas}></canvas>
          
          <br /> <br />
          {/* Button to remove the selected image */}
          <button  onClick={() => setSelectedImage(null)}>Remove</button>
        </div>
      )}

      <br />

      {/* Input element to select an image file */}
      <input
        type="file"
        name="myImage"
        // Event handler to capture file selection and update the state
        onChange={(event) => {
            if(event.target.files && event.target.files[0]) {
                event.target.files[0];
              
              console.log(event.target.files[0]); // Log the selected file
                setSelectedImage(event.target.files[0]); // Update the state with the selected file
            }
        }}
      />
    </div>
  );
};

// Export the UploadAndDisplayImage component as default
export default UploadAndDisplayImage;