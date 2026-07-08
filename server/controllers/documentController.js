const Document = require('../models/Document');
const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all documents for a trip
// @route   GET /api/trips/:tripId/documents
// @access  Private
exports.getDocuments = asyncHandler(async (req, res, next) => {
  const documents = await Document.find({ trip: req.params.tripId })
    .populate('uploadedBy', 'name email avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents,
  });
});

// @desc    Upload document
// @route   POST /api/trips/:tripId/documents
// @access  Private
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const document = await Document.create({
    trip: req.params.tripId,
    title: req.body.title || req.file.originalname,
    type: req.body.type || 'other',
    fileUrl: req.file.path,
    filePublicId: req.file.filename,
    fileType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
    notes: req.body.notes || '',
    expiryDate: req.body.expiryDate,
    uploadedBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: document,
  });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse('Document not found', 404));
  }

  // Delete from Cloudinary
  const { cloudinary } = require('../config/cloudinary');
  if (document.filePublicId) {
    await cloudinary.uploader.destroy(document.filePublicId);
  }

  await document.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
