# thumbnail

Small utility to easily and efficiently create thumbnails using GraphicsMagick.

# Usage

    // get a 100x100 thumbnail of /path/to/originals/picture.jpg

    var Thumbnail = require('thumbnail');
    var thumbnail = new Thumbnail('/path/to/originals', '/path/to/thumbnails');

    thumbnail.ensureThumbnail('picture.jpg', 100, 100, function (err, filename) {
      // "filename" is the name of the thumb in '/path/to/thumbnails'
    });

# Installation

    $ npm install thumbnail

# API

## Thumbnail(rootOriginals, rootThumbnails, [supportedImageTypes])
* rootOriginals String
* rootThumbnails String
* supportedImageTypes Array, default = [ 'png', 'jpg', 'jpeg', 'gif' ]

Construct a thumbnail object that operates on the provided paths. `rootOriginals` is the path where the original
files can be found and `rootThumbnails` is the path where thumbnails can be found and created.

`supportedImageTypes` is an optional array of supported images. Make sure your GraphicsMagick installation supports these types.

## thumbnail.ensureThumbnail(filename, width, height, cb)
* filename String
* width Number
* height Number
* cb Function

Create a thumbnail of `filename` with the requested width and height. `filename` should exist
in the `rootOriginals` path provided to the constructor. If a thumbnail with these
dimensions already exists, no new file is created and the filename of the existing thumbnail
is returned via the callback.

`width` and `height` should be the requested thumbnail size in pixels.

`cb` is called with Error or null as the first parameter. The string of the thumbnails filename
as the second parameter. And as the third parameter a boolean if the thumb has just been created
or if it already existed (in that case it will be false).

## thumbnail.rootOriginals
* String

path to original pictures as given to the constructor

## thumbnail.rootThumbnails
* String

path to thumbnails as given to the constructor

## thumbnail.supportedImageTypes
* Array

supported image types as given to the constructor

# Requirements

[GraphicksMagick](http://www.graphicsmagick.org/) must be installed on your system and the `gm` command should be available in the node environment. 

# License

MIT, see LICENSE

# Bugs

See <https://github.com/timkuijsten/node-thumbnail/issues>.
