export const chunkText = (text, maxLength = 1200, overlap = 200) => {
  const paragraphs = text.split("\n\n").filter((p) => p.trim());
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    // If a single paragraph exceeds maxLength, split it directly
    if (para.length >= maxLength) {
      if (current.trim()) chunks.push(current.trim());
      for (let i = 0; i < para.length; i += maxLength - overlap) {
        const slice = para.slice(i, i + maxLength).trim();
        if (slice) chunks.push(slice);
      }
      current = para.slice(-overlap);
      continue;
    }

    if ((current + para).length <= maxLength) {
      current += para + "\n\n";
    } else {
      if (current.trim()) chunks.push(current.trim());
      current = current.slice(-overlap) + para + "\n\n";
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks;
};