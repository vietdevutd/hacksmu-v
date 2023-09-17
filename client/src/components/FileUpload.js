import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file || uploading) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    // Send the selected file to your server for uploading
    axios.post('http://localhost:5000/api/upload', formData)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setUploading(false);
        // Clear the file input after upload is done
        document.getElementById('fileInput').value = '';
        setFile(null);
        //refresh file list
        document.getElementById('refreshButton').click()
        // Display an alert indicating upload is done
        window.alert('Upload is complete!');
      });
  };

  return (
    <div>
      <h2>File Upload</h2>
      <input id="fileInput" type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default FileUpload;