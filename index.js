const AWS = require('@aws-sdk/client-s3');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
require("dotenv").config();
const app = express();

// Set up AWS S3 bucket configuration
const s3 = new AWS.S3({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
//   useAccelerateEndpoint: true,
});
const bucketName = process.env.AWS_BUCKET;

// Set up bodyParser to parse incoming requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Set up CORS
app.use(cors());

// // Set up Multer middleware to handle file uploads
// // by default, multer will store files in memory
const upload = multer()

// Initiate multipart upload and return uploadId
app.post('/initiateUpload', async (req, res) => {
	try {
	  const { fileName } = req.body;
	  const params = {
		Bucket: bucketName,
		Key: fileName,
	  };
  
	  const upload = await s3.createMultipartUpload(params); // Use async/await
	  res.json({ uploadId: upload.UploadId });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ success: false, message: 'Error initializing upload' });
	}
  });
  


// Receive chunk and write it to S3 bucket
app.post('/upload', upload.single("file"), async (req, res) => {
	const { index, fileName } = req.body;
	const file = req.file;
  
	const s3Params = {
	  Bucket: bucketName,
	  Key: fileName,
	  Body: file.buffer,
	  PartNumber: Number(index) + 1,
	  UploadId: req.query.uploadId,
	};
  
	try {
	  const data = await s3.uploadPart(s3Params);
	  res.json({ success: true, message: 'Chunk uploaded successfully',data: data });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ success: false, message: 'Error uploading chunk: ' + err.message });
	}
  });
  

// Complete multipart upload
app.post('/completeUpload', (req, res) => {
  const { fileName } = req.query;
  const s3Params = {
    Bucket: bucketName,
    Key: fileName,
    UploadId: req.query.uploadId
  };

  s3.listParts(s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Error listing parts' });
    }

    const parts = [];
    data.Parts.forEach(part => {
      parts.push({
        ETag: part.ETag,
        PartNumber: part.PartNumber
      });
    });

    s3Params.MultipartUpload = {
      Parts: parts,
    };
    s3.completeMultipartUpload(s3Params, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Error completing upload' });
      }

      const publicParams = {
        Bucket: bucketName,
        Key: fileName,
        ACL: 'public-read'
      };
    
      s3.putObjectAcl(publicParams, (aclErr, aclData) => {
        if (aclErr) {
          console.log(aclErr);
          // Handle error setting public access
        } else {
          console.log("data: ", data)
          return res.json({ success: true, message: 'Upload complete', data: data.Location});
        }
      });
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
