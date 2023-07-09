// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RequestHandler} from 'express-serve-static-core';

export type FileUploadHandler = RequestHandler;

export type File = {
  buffer: Buffer
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
}
export type CloudinaryRes = {
  asset_id?: string;
  public_id?: string;
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: Date;
  tags?: any[];
  bytes?: number;
  type?: string;
  etag?: string;
  placeholder?: boolean;
  url?: string;
  secure_url?: string;
  folder?: string;
  original_filename?: string;
  api_key?: string;
}
