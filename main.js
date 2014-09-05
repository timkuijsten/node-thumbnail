var path = require('path');
var fs = require('fs');
var execFile = require('child_process').execFile;

/**
 * Create thumbnails from files with GraphicsMagick.
 *
 * @param {String} rootOriginals  the path where original pictures are stored.
 * @param {String} rootThumbnails  the path where the thumbnails are stored.
 * @param {Array, default: [ 'png', 'jpg', 'jpeg', 'gif' ]} supportedImageTypes
 *                                       list of extensions to support
 */
function Thumbnail(rootOriginals, rootThumbnails, supportedImageTypes) {
  if (!rootOriginals) { throw new Error('provide rootOriginals'); }
  if (!rootThumbnails) { throw new Error('provide rootThumbnails'); }

  if (typeof rootOriginals !== 'string') { throw new TypeError('rootOriginals must be a string'); }
  if (typeof rootThumbnails !== 'string') { throw new TypeError('rootThumbnails must be a string'); }

  this.supportedImageTypes = supportedImageTypes || [ 'png', 'jpg', 'jpeg', 'gif' ];

  if (!Array.isArray(this.supportedImageTypes)) { throw new TypeError('supportedImageTypes must be an array'); }

  this._supportedExtensions = this.supportedImageTypes.map(function(item) {
    return '.'+item;
  });

  this.rootOriginals = rootOriginals;
  this.rootThumbnails = rootThumbnails;
}

module.exports = Thumbnail;

/**
 * Return the path to the desired thumbnail, create one if it does not yet exist.
 *
 * @param {String} filename  filename of the original file
 * @param {Number} width  the width in pixels of the thumb
 * @param {Number} height  the height in pixels of the thumb
 * @param {Function} cb  callback called with Error or null as the first parameter.
 *                       The string of the thumbnails filename as the second
 *                       parameter. The third parameter a boolean if the thumb has
 *                       just created or not.
 */
Thumbnail.prototype.ensureThumbnail = function ensureThumbnail(filename, width, height, cb) {
  if (!filename) { throw new Error('provide filename'); }
  if (!width && !height) { throw new Error('provide width and/or height'); }
  if (!cb) { throw new Error('provide cb'); }

  if (typeof filename !== 'string') { throw new TypeError('filename must be a string'); }
  if (width && typeof width !== 'number') { throw new TypeError('width must be a number'); }
  if (height && typeof height !== 'number') { throw new TypeError('height must be a number'); }
  if (typeof cb !== 'function') { throw new TypeError('cb must be a function'); }

  if (filename !== path.basename(filename)) { throw new Error('filename contains a path'); }

  var extension = path.extname(filename);
  if (!~this._supportedExtensions.indexOf(extension.toLowerCase())) { throw new TypeError('image type not supported'); }

  var wxh = '';
  if (height) { wxh = 'x'+height; }
  if (width) { wxh = width + wxh; }

  var thumbFilename = path.basename(filename, extension)+'-'+wxh+extension;

  var that = this;

  // check if the original exists
  fs.stat(that.rootOriginals+'/'+filename, function(err, statsOriginal) {
    if (err) { cb(err); return; }

    fs.stat(that.rootThumbnails+'/'+thumbFilename, function (err, statsThumb) {
      if (err && err.code !== 'ENOENT') { cb(err); return; }

      // check if the thumb is modified after the original otherwise recreate
      if (!err && statsOriginal.mtime < statsThumb.mtime) { cb(null, thumbFilename, false); return; }

      var args = [
        'convert',
        '-size', wxh,
        that.rootOriginals+'/'+filename,
        '-thumbnail', wxh+'^',
        '-gravity', 'center'
      ];

      if (height && width) {
        args = args.concat(['-extent', wxh]);
      }

      args = args.concat([
        '+profile', '"*"',
        that.rootThumbnails+'/'+thumbFilename
      ]);

      var opts = { timeout: 5000 };

      execFile('gm', args, opts, function(err, stdout, stderr) {
        if (err) {
          // add descriptive text if gm is not found
          if (err.code === 'ENOENT' || err.code === 127) {
            err.message = 'gm not found, make sure GraphicsMagick is installed and gm is available in your environment. ' +
              err.message;
          }
          cb(err);
          return;
        }
        if (stderr) { cb(new Error(stderr)); return; }

        cb(null, thumbFilename, true);
      });
    });
  });
};
