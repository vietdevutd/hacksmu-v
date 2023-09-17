import React, { useEffect, useState } from 'react';
import axios from 'axios';
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}

function FileList() {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchFileList = () => {
        setIsLoading(true);
        // Fetch the list of files from your server
        axios.get('http://localhost:5000/api/list-files')
            .then((response) => {
                setFiles(response.data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        // Initial file list fetch
        // if (files.length === 0) {
            fetchFileList();
        //}   
    }, []);
    
    return (
        <div>
            <h2>File List</h2>
            <button id="refreshButton" onClick={fetchFileList} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <table>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th style={{ paddingLeft: '200px' }}>File Size</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'left' }}>{file.name}</td>
                            <td style={{ textAlign: 'right' }}>{formatFileSize(file.size)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FileList;
