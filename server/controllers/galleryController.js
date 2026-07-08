const Gallery = require('../models/Gallery');
const Trip = require('../models/Trip');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get gallery for a trip
// @route   GET /api/trips/:tripId/gallery
// @access  Private
exports.getGallery = asyncHandler(async (req, res, next) => {
  const gallery = await Gallery.findOne({ trip: req.params.tripId })
    .populate('media.uploadedBy', 'name email avatar');

  if (!gallery) {
    return res.status(200).json({
      success: true,
      data: { media: [], albums: [] },
    });
  }

  res.status(200).json({
    success: true,
    data: gallery,
  });
});

// @desc    Upload media to gallery
// @route   POST /api/trips/:tripId/gallery
// @access  Private
exports.uploadMedia = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  let gallery = await Gallery.findOne({ trip: req.params.tripId });

  if (!gallery) {
    gallery = await Gallery.create({
      trip: req.params.tripId,
      media: [],
      albums: [],
    });
  }

  gallery.media.push({
    url: req.file.path,
    publicId: req.file.filename,
    mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
    caption: req.body.caption || '',
    uploadedBy: req.user.id,
  });

  await gallery.save();

  res.status(201).json({
    success: true,
    data: gallery,
  });
});

// @desc    Delete media from gallery
// @route   DELETE /api/trips/:tripId/gallery/:mediaId
// @access  Private
exports.deleteMedia = asyncHandler(async (req, res, next) => {
  const gallery = await Gallery.findOne({ trip: req.params.tripId });

  if (!gallery) {
    return next(new ErrorResponse('Gallery not found', 404));
  }

  const media = gallery.media.id(req.params.mediaId);
  if (!media) {
    return next(new ErrorResponse('Media not found', 404));
  }

  // Delete from Cloudinary
  const { cloudinary } = require('../config/cloudinary');
  if (media.publicId) {
    await cloudinary.uploader.destroy(media.publicId);
  }

  media.deleteOne();
  await gallery.save();

  res.status(200).json({
    success: true,
    data: gallery,
  });
});

// @desc    Create album
// @route   POST /api/trips/:tripId/gallery/albums
// @access  Private
exports.createAlbum = asyncHandler(async (req, res, next) => {
  let gallery = await Gallery.findOne({ trip: req.params.tripId });

  if (!gallery) {
    gallery = await Gallery.create({
      trip: req.params.tripId,
      media: [],
      albums: [],
    });
  }

  gallery.albums.push({
    name: req.body.name,
    description: req.body.description || '',
    coverImage: req.body.coverImage || '',
    createdBy: req.user.id,
  });

  await gallery.save();

  res.status(201).json({
    success: true,
    data: gallery,
  });
});
