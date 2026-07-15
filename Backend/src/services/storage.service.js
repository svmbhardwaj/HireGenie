const logger = require("../config/logger")


/*
 * Storage provider is picked from the environment: S3 when AWS credentials are
 * present, otherwise Cloudinary. Both SDKs are required lazily so the unused
 * provider's env vars are never needed.
 */
const provider = process.env.AWS_ACCESS_KEY_ID ? "s3" : "cloudinary"


/**
 * @name uploadToS3
 * @description Upload a buffer to S3 and return its public URL.
 */
async function uploadToS3(buffer, { folder, filename, contentType }) {
    const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

    const client = new S3Client({ region: process.env.AWS_REGION })

    const key = `${folder}/${filename}`

    await client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType
    }))

    return {
        url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    }
}


/**
 * @name uploadToCloudinary
 * @description Upload a buffer to Cloudinary and return its secure URL. Files are
 * uploaded as "raw" resources since resumes and PDFs are not images.
 */
async function uploadToCloudinary(buffer, { folder, filename }) {
    const cloudinary = require("cloudinary").v2

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

    const result = await new Promise(function (resolve, reject) {
        cloudinary.uploader.upload_stream(
            { folder, public_id: filename, resource_type: "raw" },
            function (err, uploadResult) {
                if (err) return reject(err)
                resolve(uploadResult)
            }
        ).end(buffer)
    })

    return { url: result.secure_url }
}


/**
 * @name uploadFile
 * @description Upload a file buffer to the configured cloud storage provider.
 * Returns { url } of the stored file.
 */
async function uploadFile(buffer, { folder, filename, contentType }) {

    logger.debug({ provider, folder, filename }, "Uploading file to cloud storage")

    if (provider === "s3") {
        return uploadToS3(buffer, { folder, filename, contentType })
    }

    return uploadToCloudinary(buffer, { folder, filename })
}


module.exports = { uploadFile }
