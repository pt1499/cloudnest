const cloudinary = require('../utils/cloudinary');
const prisma = require('../utils/prisma');

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { folderId } = req.body;

    // Cloudinary pe upload karo (buffer se)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // image, video, raw sab handle karega
          folder: `cloudnest/${req.user.id}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // DB mein save karo
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        userId: req.user.id,
        folderId: folderId || null,
      }
    });

    // Storage update karo
    await prisma.user.update({
      where: { id: req.user.id },
      data: { storageUsed: { increment: req.file.size } }
    });

    res.status(201).json({ message: 'File uploaded!', file });

  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// Get all files
exports.getFiles = async (req, res) => {
  try {
    const { folderId } = req.query;

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        folderId: folderId || null,
        isTrashed: false,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    // Cloudinary se delete karo
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: 'auto'
    });

    // DB se delete karo
    await prisma.file.delete({ where: { id: req.params.id } });

    // Storage update karo
    await prisma.user.update({
      where: { id: req.user.id },
      data: { storageUsed: { decrement: file.size } }
    });

    res.json({ message: 'File deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Star/Unstar file
exports.toggleStar = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    const updated = await prisma.file.update({
      where: { id: req.params.id },
      data: { isStarred: !file.isStarred }
    });

    res.json({ message: 'Updated!', file: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Trash file
exports.trashFile = async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    await prisma.file.update({
      where: { id: req.params.id },
      data: { isTrashed: true }
    });

    res.json({ message: 'File moved to trash!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};