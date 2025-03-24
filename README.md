# AWS Multipart Uploader

A robust and efficient utility for uploading large files to Amazon S3 using multipart upload, with support for pause/resume, progress tracking, and concurrent uploads.

## Features

### 1. **Multipart Upload Support**
   - Split large files into smaller parts for parallel upload
   - Automatically handles part sizing and upload sequencing
   - Compliant with AWS S3 multipart upload specifications

### 2. **Pause and Resume Capability**
   - Interrupt uploads at any time and resume later
   - Maintains upload state to avoid re-uploading completed parts
   - Saves progress to local storage for reliability

### 3. **Progress Tracking**
   - Real-time upload progress monitoring
   - Detailed statistics including:
     - Bytes transferred
     - Percentage complete
     - Upload speed
     - Time remaining

### 4. **Concurrent Uploads**
   - Configurable concurrency for optimal performance
   - Automatic thread management
   - Efficient use of system resources

### 5. **Customizable Configuration**
   - Adjustable part size (default: 5MB)
   - Configurable retry logic for failed parts
   - Customizable S3 metadata and tags

### 6. **Error Handling and Retries**
   - Automatic retry of failed parts
   - Configurable retry limits
   - Detailed error reporting

### 7. **Cross-Platform Support**
   - Works on Windows, macOS, and Linux
   - Compatible with Node.js and modern browsers

### 8. **AWS SDK Integration**
   - Seamless integration with AWS JavaScript SDK
   - Supports all AWS regions and S3 configurations
   - Works with standard AWS credentials

### 9. **Event Hooks**
   - Lifecycle event callbacks for:
     - Upload start/complete
     - Part completion
     - Progress updates
     - Errors

## Getting Started

```javascript
const uploader = new S3MultipartUploader({
  accessKeyId: 'YOUR_AWS_ACCESS_KEY',
  secretAccessKey: 'YOUR_AWS_SECRET_KEY',
  region: 'us-east-1',
  bucket: 'your-bucket-name'
});

uploader.upload({
  file: yourFileObject,
  key: 'path/to/your/file.ext',
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
}).then(() => {
  console.log('Upload complete!');
}).catch((error) => {
  console.error('Upload failed:', error);
});
```

## Installation

```bash
npm install aws-multipart-uploader
# or
yarn add aws-multipart-uploader
```

## License

MIT © Er Raj Aryan
