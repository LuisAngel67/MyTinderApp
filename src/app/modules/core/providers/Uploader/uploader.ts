import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Uploader {
  private supabaseUrl = environment.SUPABASE_CONFIG.SUPABASE_URL;
  private supabaseKey = environment.SUPABASE_CONFIG.SUPABASE_KEY;
  private defaultBucket = environment.SUPABASE_CONFIG.SUPABASE_BUCKET1;

  constructor() {}

  async uploadToSupabase(file: File, path: string): Promise<string> {
    if (!file) throw new Error('No file provided');

    let bucket = this.defaultBucket;
    let objectKey = path;
    if (path.includes('/')) {
      const parts = path.split('/');
      bucket = parts.shift() as string;
      objectKey = parts.join('/');
    }

    const uploadUrl = `${
      this.supabaseUrl
    }/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(
      objectKey
    )}`;

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        apikey: this.supabaseKey,
        Authorization: `Bearer ${this.supabaseKey}`,
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }

    return `${this.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(
      bucket
    )}/${encodeURIComponent(objectKey)}`;
  }
}
