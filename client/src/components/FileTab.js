import React from 'react';
import FileList from './FileList';
import FileUpload from './FileUpload';

function FileTab({ fileList }) { // Add fileList as a prop
  return (
    <div>
      <FileList />
      <FileUpload />
    </div>
  );
}

export default FileTab;
