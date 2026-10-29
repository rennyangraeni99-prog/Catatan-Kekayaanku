export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

/**
 * List files from Google Drive
 * Defaults to filtering for Catatan Kekayaanku backup files or allows searching
 */
export async function listDriveFiles(
  accessToken: string,
  searchQuery?: string
): Promise<DriveFileItem[]> {
  try {
    let q = "trashed = false";
    if (searchQuery && searchQuery.trim()) {
      q += ` and name contains '${searchQuery.trim().replace(/'/g, "\\'")}'`;
    }

    const fields = 'files(id, name, mimeType, modifiedTime, size, webViewLink)';
    const url = `${DRIVE_API_URL}/files?q=${encodeURIComponent(q)}&orderBy=modifiedTime desc&pageSize=30&fields=${encodeURIComponent(fields)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal memuat berkas Drive (${response.status})`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error: any) {
    console.error('listDriveFiles error:', error);
    throw error;
  }
}

/**
 * Upload a new file to Google Drive using multipart upload
 */
export async function uploadToDrive(
  accessToken: string,
  filename: string,
  content: string,
  mimeType: string = 'application/json'
): Promise<DriveFileItem> {
  try {
    const metadata = {
      name: filename,
      mimeType: mimeType,
      description: 'Cadangan data transaksi Catatan Kekayaanku',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;

    const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal mengunggah berkas ke Google Drive (${response.status})`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('uploadToDrive error:', error);
    throw error;
  }
}

/**
 * Download file content from Google Drive
 */
export async function downloadDriveFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  try {
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal mengunduh isi berkas Drive (${response.status})`);
    }

    return await response.text();
  } catch (error: any) {
    console.error('downloadDriveFileContent error:', error);
    throw error;
  }
}

/**
 * Delete a file from Google Drive
 * (Note: Caller must display user confirmation modal before invoking this!)
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  try {
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal menghapus berkas di Google Drive (${response.status})`);
    }
  } catch (error: any) {
    console.error('deleteDriveFile error:', error);
    throw error;
  }
}
