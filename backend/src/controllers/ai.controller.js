const model = require('../utils/gemini');
const prisma = require('../utils/prisma');
const cloudinary = require('../utils/cloudinary');

// File ko auto-tag karo
exports.tagFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    // Gemini se tags maango
    const prompt = `
      Ek file hai jiska naam "${file.name}" hai aur type "${file.mimeType}" hai.
      Is file ke liye 5 short relevant tags suggest karo.
      Sirf tags return karo — comma separated, koi explanation nahi.
      Example: technology, document, report, business, data
    `;

    const result = await model.generateContent(prompt);
    const tagsText = result.response.text();
    const tags = tagsText.split(',').map(t => t.trim().toLowerCase());

    // Tags DB mein save karo
    const updated = await prisma.file.update({
      where: { id: req.params.id },
      data: { aiTags: tags }
    });

    res.json({ message: 'Tags generated!', tags, file: updated });

  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
};

// File summary banao
exports.summarizeFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    const prompt = `
      Ek file hai:
      - Naam: ${file.name}
      - Type: ${file.mimeType}
      - Size: ${(file.size / 1024).toFixed(1)} KB
      
      Is file ke baare mein ek short 2-line summary likho.
      Simple English mein likho.
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    // Summary DB mein save karo
    const updated = await prisma.file.update({
      where: { id: req.params.id },
      data: { aiSummary: summary }
    });

    res.json({ message: 'Summary generated!', summary, file: updated });

  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
};

// Smart search
exports.smartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    // User ki saari files lo
    const files = await prisma.file.findMany({
      where: { userId: req.user.id, isTrashed: false }
    });

    if (files.length === 0) {
      return res.json({ files: [], message: 'No files found' });
    }

    // Files ki list Gemini ko do
    const filesList = files.map(f =>
      `ID: ${f.id} | Name: ${f.name} | Type: ${f.mimeType} | Tags: ${f.aiTags.join(', ')}`
    ).join('\n');

    const prompt = `
      User ne search kiya: "${query}"
      
      Yeh files available hain:
      ${filesList}
      
      Search query ke basis pe relevant file IDs return karo.
      Sirf IDs return karo — comma separated.
      Example: abc123, def456
      Agar koi relevant file nahi hai toh "none" likho.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    if (responseText.toLowerCase() === 'none') {
      return res.json({ files: [], message: 'No matching files' });
    }

    const ids = responseText.split(',').map(id => id.trim());
    const matchedFiles = files.filter(f => ids.includes(f.id));

    res.json({ files: matchedFiles });

  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
};