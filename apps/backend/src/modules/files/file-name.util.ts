const mojibakePattern = /(?:Ã.|â.|ð|Ì|�)/;

export function normalizeUploadedFilename(originalname: string) {
  if (!mojibakePattern.test(originalname)) {
    return originalname;
  }

  const decoded = Buffer.from(originalname, 'latin1').toString('utf8');
  return decoded.normalize('NFC');
}

