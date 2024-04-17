const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
require("dotenv").config();
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3")
const app = express();

// Set up AWS S3 bucket configuration
const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
  // useAccelerateEndpoint: true,
});

const bucketName = process.env.AWS_BUCKET;

// Set up bodyParser to parse incoming requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Set up CORS
app.use(cors());
// Handle file uploading
const upload = multer()

const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send(`
    <h2>File Upload With <code>"Node.js"</code></h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Select a file: 
        <input name="file" type="file" />
      </div>
      <input type="submit" value="Upload" />
    </form>

  `);
});

app.post('/api/upload',upload.single("file"), async (req, res) => {
  const file = req.file
	// params for s3 upload
	const params = {
		Bucket: bucketName,
		Key: `${Date.now().toString()}_${file.originalname}`,
		Body: file.buffer,
	}

	try {
		// upload file to s3 parallelly in chunks
		// it supports min 5MB of file size
		const uploadParallel = new Upload({
			client: s3,
			queueSize: 4, // optional concurrency configuration
			partSize: 5542880, // optional size of each part
			leavePartsOnError: false, // optional manually handle dropped parts
			params,
		})

		// checking progress of upload
		uploadParallel.on("httpUploadProgress", progress => {
			console.log(progress)
		})

		// after completion of upload
		uploadParallel.done().then(data => {
			console.log("upload completed!", { data })
			return res.json({ success: true, data: data.Location })
		})
	} catch (error) {
		res.send({
			success: false,
			message: error.message,
		})
	}
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
})
