const AWS = require("aws-sdk");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");

// name of your bucket here
const NAME_OF_BUCKET = "soundcloud-bucket";

//  make sure to set environment variables in production for:
//  AWS_ACCESS_KEY_ID
//  AWS_SECRET_ACCESS_KEY
//  and aws will automatically use those environment variables
//  (S18 moves this to AWS SDK v3 with an IAM role and no access keys.)

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

// --------------------------- Upload rules ------------------------
// Files are held in memory (multer memoryStorage) before going to S3, so
// these limits also protect the server's RAM.

const MB = 1024 * 1024;

const UPLOAD_RULES = {
  audio: {
    maxBytes: 20 * MB,
    mimeTypes: ["audio/mpeg", "audio/mp4", "audio/x-m4a"],
    label: "MP3 or M4A audio file",
  },
  image: {
    maxBytes: 5 * MB,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    label: "JPEG, PNG or WebP image",
  },
};

const httpError = (status, message, title = "Bad request.") => {
  const err = new Error(message);
  err.status = status;
  err.title = title;
  err.errors = [message];
  return err;
};

// S3 "folder" for a file, based on its MIME type.
const prefixFor = (mimetype = "") =>
  mimetype.startsWith("audio/") ? "audio" : mimetype.startsWith("image/") ? "images" : "other";

// Random, collision-proof object key, e.g. "audio/3f2c...-....mp3".
// (The old key was a millisecond timestamp, which two uploads in the same
// millisecond would share, so one file would overwrite the other.)
const makeKey = (originalname, mimetype) =>
  `${prefixFor(mimetype)}/${crypto.randomUUID()}${path.extname(originalname || "").toLowerCase()}`;

// No `ACL: "public-read"`: new S3 buckets enforce "bucket owner" object
// ownership and REJECT uploads that set an ACL. Public reads should come
// from a bucket policy / CloudFront instead (S43).
const uploadToS3 = async (file) => {
  if (!file) throw httpError(400, "A file is required.");
  const { originalname, mimetype, buffer } = await file;
  const uploadParams = {
    Bucket: NAME_OF_BUCKET,
    Key: makeKey(originalname, mimetype),
    Body: buffer,
    ContentType: mimetype,
  };
  return s3.upload(uploadParams).promise();
};

// --------------------------- Public UPLOAD ------------------------

const singlePublicFileUpload = async (file) => {
  const result = await uploadToS3(file);
  // save the URL of the file in your database
  return result.Location;
};

const multiplePublicFileUpload = async (files) => {
  return await Promise.all(
    files.map((file) => {
      return singlePublicFileUpload(file);
    })
  );
};

// --------------------------- Private UPLOAD ------------------------

const singlePrivateFileUpload = async (file) => {
  const result = await uploadToS3(file);
  // save the key of the file in your database to retrieve for later
  return result.Key;
};

const multiplePrivateFileUpload = async (files) => {
  return await Promise.all(
    files.map((file) => {
      return singlePrivateFileUpload(file);
    })
  );
};

const retrievePrivateFile = (key) => {
  let fileUrl;
  if (key) {
    fileUrl = s3.getSignedUrl("getObject", {
      Bucket: NAME_OF_BUCKET,
      Key: key,
    });
  }
  return fileUrl || key;
};

// --------------------------- Storage ------------------------

const storage = multer.memoryStorage();

const makeMulter = (kind, maxFiles) => {
  const rules = UPLOAD_RULES[kind];
  if (!rules) throw new Error(`Unknown upload kind: ${kind}`);

  return multer({
    storage,
    limits: { fileSize: rules.maxBytes, files: maxFiles, fields: 20, fieldSize: 100 * 1024 },
    fileFilter: (_req, file, cb) => {
      // Note: the MIME type comes from the browser, so this is a guard
      // against mistakes and casual abuse, not proof of the file's content.
      if (rules.mimeTypes.includes(file.mimetype)) return cb(null, true);
      return cb(httpError(415, `Unsupported file type. Please upload a ${rules.label}.`, "Unsupported file type"));
    },
  });
};

// Wrap multer so its errors become normal 4xx API errors.
const withMulterErrors = (middleware, kind) => (req, res, next) =>
  middleware(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        const maxMb = UPLOAD_RULES[kind].maxBytes / MB;
        return next(httpError(413, `File is too large. The limit is ${maxMb} MB.`, "File too large"));
      }
      return next(httpError(400, err.message));
    }
    return next(err);
  });

// kind is "image" (default) or "audio"
const singleMulterUpload = (nameOfKey, kind = "image") =>
  withMulterErrors(makeMulter(kind, 1).single(nameOfKey), kind);
const multipleMulterUpload = (nameOfKey, kind = "image") =>
  withMulterErrors(makeMulter(kind, 10).array(nameOfKey), kind);

module.exports = {
  s3,
  UPLOAD_RULES,
  singlePublicFileUpload,
  multiplePublicFileUpload,
  singlePrivateFileUpload,
  multiplePrivateFileUpload,
  retrievePrivateFile,
  singleMulterUpload,
  multipleMulterUpload,
};
