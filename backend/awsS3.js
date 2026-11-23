const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const { s3: s3Config } = require("./config");

// AWS SDK v3. Settings come from env vars (see config/index.js):
//   S3_BUCKET       bucket for uploads            (default "soundcloud-bucket")
//   AWS_REGION      the bucket's region           (default "us-west-2")
//   MEDIA_BASE_URL  public URL prefix for uploads (default: the bucket's
//                   S3 URL; later a CloudFront URL such as https://xyz.cloudfront.net/media)
//
// Credentials: none are configured here. The SDK finds them by itself
// (its "default credential provider chain"): on EC2 from the instance's IAM
// role, locally from `aws configure` / AWS_PROFILE, or from
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY if those env vars are set.
// Never put access keys in the repo.
const s3 = new S3Client({ region: s3Config.region });

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
  const { originalname, mimetype, buffer } = file;
  const key = makeKey(originalname, mimetype);
  // lib-storage's Upload switches to a multipart upload for large files.
  await new Upload({
    client: s3,
    params: {
      Bucket: s3Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    },
  }).done();
  return key;
};

// Public URL for an object key, e.g. https://<bucket>.s3.<region>.amazonaws.com/audio/<uuid>.mp3
const publicUrlFor = (key) =>
  `${s3Config.mediaBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

// --------------------------- Public UPLOAD ------------------------

// Uploads one multer file and returns the URL to save in the database.
const singlePublicFileUpload = async (file) => publicUrlFor(await uploadToS3(file));

const multiplePublicFileUpload = async (files) =>
  Promise.all(files.map((file) => singlePublicFileUpload(file)));

// (The unused "private upload" helpers and signed-URL helper were removed in S18.)

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
  publicUrlFor,
  singlePublicFileUpload,
  multiplePublicFileUpload,
  singleMulterUpload,
  multipleMulterUpload,
};
