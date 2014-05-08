/*jshint -W068, -W030 */

var should = require('should');
var Thumbnail = require('../main');
var fs = require('fs');
var os = require('os');

var pathToOriginal = __dirname+'/fixtures';
var pathToThumbs = os.tmpDir();

var fixtureFile = 'test.jpg';

// cleanup created thumb
after(function(done) {
  fs.unlink(pathToThumbs+'/test-16x16.jpg', done);
});

describe('Thumbnail', function () {
  describe('constructor', function () {
    it('should require rootOriginals', function() {
      (function () { new Thumbnail(); }).should.throw('provide rootOriginals');
    });

    it('should require rootThumbnails', function() {
      (function () { new Thumbnail(pathToOriginal); }).should.throw('provide rootThumbnails');
    });

    it('should require rootOriginals to be a string', function() {
      (function () { new Thumbnail({}, pathToThumbs); }).should.throw('rootOriginals must be a string');
    });

    it('should require rootThumbnails to be a string', function() {
      (function () { new Thumbnail(pathToOriginal, {}); }).should.throw('rootThumbnails must be a string');
    });

    it('should require supportedImageTypes to be an array', function() {
      (function () { new Thumbnail(pathToOriginal, pathToThumbs, {}); }).should.throw('supportedImageTypes must be an array');
    });

    it('should support custom types', function() {
      var thumbnail = new Thumbnail(pathToOriginal, pathToThumbs, ['bmp']);
      should.deepEqual(thumbnail.supportedImageTypes, ['bmp']);
    });

    it('should construct', function() {
      (function () { new Thumbnail(pathToOriginal, pathToThumbs); }).should.not.throw();
    });
  });

  describe('ensureThumbnail', function () {
    var thumbnail = new Thumbnail(pathToOriginal, pathToThumbs);

    it('should require filename', function() {
      (function () { thumbnail.ensureThumbnail(); }).should.throw('provide filename');
    });

    it('should require width and/or height', function() {
      (function () { thumbnail.ensureThumbnail(fixtureFile); }).should.throw('provide width and/or height');
    });

    it('should require cb', function() {
      (function () { thumbnail.ensureThumbnail(fixtureFile, 16, 16); }).should.throw('provide cb');
    });

    it('should require filename to be a string', function() {
      (function () { thumbnail.ensureThumbnail({}, 16, 16, function() {}); }).should.throw('filename must be a string');
    });

    it('should require width to be a string', function() {
      (function () { thumbnail.ensureThumbnail(fixtureFile, {}, 16, function() {}); }).should.throw('width must be a number');
    });

    it('should require height to be a string', function() {
      (function () { thumbnail.ensureThumbnail(fixtureFile, 16, {}, function() {}); }).should.throw('height must be a number');
    });

    it('should require cb to be a function', function() {
      (function () { thumbnail.ensureThumbnail(fixtureFile, 16, 16, {}); }).should.throw('cb must be a function');
    });

    it('should only allow certain image types, based on extension', function() {
      (function () { thumbnail.ensureThumbnail('none.bmp', 16, 16, function() {}); }).should.throw('image type not supported');
    });

    it('should check if the original file exists', function(done) {
      thumbnail.ensureThumbnail('none.jpg', 16, 16, function(err) {
        err.should.have.property('code', 'ENOENT');
        done();
      });
    });

    it('should create a thumbnail when it does not exist yet', function(done) {
      thumbnail.ensureThumbnail(fixtureFile, 16, 16, function (err, filename, created) {
        if (err) { throw err; }

        created.should.be.true;

        fs.exists(pathToThumbs + '/' + filename, function (exists) {
          exists.should.be.true;
          done();
        });
      });
    });

    it('should not create a thumbnail when it does already exist', function(done) {
      thumbnail.ensureThumbnail(fixtureFile, 16, 16, function (err, filename, created) {
        if (err) { throw err; }

        created.should.be.false;

        fs.exists(pathToThumbs + '/' + filename, function (exists) {
          exists.should.be.true;
          done();
        });
      });
    });

    it('should create a thumbnail when original is newer than existing thumbnail', function(done) {
      var original = pathToOriginal + '/' + fixtureFile;
      fs.utimes(original, new Date(), new Date(), function() {
        thumbnail.ensureThumbnail(fixtureFile, 16, 16, function (err, filename, created) {
          if (err) { throw err; }

          created.should.be.true;

          fs.exists(pathToThumbs + '/' + filename, function (exists) {
            exists.should.be.true;
            done();
          });
        });
      });
    });

    it('should set the width and height in the filename', function(done) {
      thumbnail.ensureThumbnail(fixtureFile, 16, 16, function (err, filename) {
        if (err) { throw err; }

        filename.should.match(/16x16/);
        done();
      });
    });
  });
});
