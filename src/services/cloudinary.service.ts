import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import streamifier from 'streamifier';
import {CloudinaryRes} from '../types';
dotenv.config();
@injectable({scope: BindingScope.TRANSIENT})
export class CloudinaryService {

  constructor(/* Add @inject to inject parameters */) {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
  async upload(image: Buffer | undefined): Promise<CloudinaryRes> {
    if (image)
      return new Promise((resolve: (value: CloudinaryRes) => void, reject: (reason?: any) => void) => {
        cloudinary.v2.uploader.upload('sdfd')
        const cld_upload_stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: "image"
          },
          function (error, result) {
            if (error)
              reject(error)
            else {
              resolve(result as any)
            }
          }
        );
        streamifier.createReadStream(image).pipe(cld_upload_stream);
      })
    else {
      throw HttpErrors.BadRequest('missing avatar')
    }
  }
  /*
   * Add service methods here
   */
}
