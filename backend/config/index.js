//backend/config/index.js

module.exports = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    dbFile: process.env.DB_FILE,
    jwtConfig: {
        secret: process.env.JWT_SECRET,
        // Token lifetime in seconds (a string from the env, e.g. "604800").
        // Parsed and checked in utils/auth.js. Default: 7 days.
        expiresIn: process.env.JWT_EXPIRES_IN || '604800'
    },
    // S3 uploads (awsS3.js). Defaults match the original hard-coded bucket.
    s3: {
        bucket: process.env.S3_BUCKET || 'soundcloud-bucket',
        region: process.env.AWS_REGION || 'us-west-2',
        get mediaBaseUrl() {
            const base = process.env.MEDIA_BASE_URL
                || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
            return base.replace(/\/+$/, ''); // no trailing slash
        }
    }
};
