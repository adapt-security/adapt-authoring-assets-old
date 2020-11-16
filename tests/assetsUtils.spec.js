const should = require('should');
const AssetsUtils = require('./../lib/assetsUtils');
const data = require('./data/data');
describe('AssetsUtils', function () {
  describe('AssetsUtils.nameToPath', function () {
    data.pathNameTuple.forEach((entry) => {
      let filename = entry.filename;
      let filepath = entry.filepath;
        it(`should return the correct Path for ${filename} -> ${filepath}`, function () {
          AssetsUtils.nameToPath(filename).should.equal(filepath)
        });
      }
    );
  });
  describe('AssetsUtils.pathToName', function () {
    data.pathNameTuple.forEach((entry) => {
      let filename = entry.filename;
      let filepath = entry.filepath;
        it(`should return the correct Name for ${filepath} -> ${filename}`, function () {
          AssetsUtils.pathToName(filepath).should.equal(filename)
        });
      }
    );
  });
  describe('AssetsUtils.getThumbPath', function () {
    data.imageThumbTuple.forEach((entry) => {
        let image = entry.image;
        let thumb = entry.thumb;
        let thumbSuffix = entry.thumbSuffix
        it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
          AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
        });
      }
    );
  });
  //TODO:getVideoPosterPath
  describe('AssetsUtils.getVideoPosterPath', function () {
    data.videoThumbTuple.forEach((entry) => {
        let video = entry.video;
        let poster = entry.poster;
        let posterSuffix = entry.posterSuffix;

        it(`should return the correct Poster Path for ${video} ${posterSuffix} -> ${poster}`, function () {
          AssetsUtils.getVideoPosterPath(video, posterSuffix).should.equal(poster);
        });
      }
    );
  });
  //TODO:getMaxThumbSize
  describe('AssetsUtils.getMaxThumbSize', function () {
    // data.imageThumbTuple.forEach((entry) => {
    //     let image = entry.image;
    //     let thumb = entry.thumb;
    //     let thumbSuffix = entry.thumbSuffix
    //     it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
    //       AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
    //     });
    //   }
    // );
  });
  //TODO:extensionByMimetype
  describe('AssetsUtils.extensionByMimetype', function () {
    // data.imageThumbTuple.forEach((entry) => {
    //     let image = entry.image;
    //     let thumb = entry.thumb;
    //     let thumbSuffix = entry.thumbSuffix
    //     it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
    //       AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
    //     });
    //   }
    // );
  });
  //TODO:mimetypeByExtension
  describe('AssetsUtils.mimetypeByExtension', function () {
    // data.imageThumbTuple.forEach((entry) => {
    //     let image = entry.image;
    //     let thumb = entry.thumb;
    //     let thumbSuffix = entry.thumbSuffix
    //     it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
    //       AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
    //     });
    //   }
    // );
  });
  //TODO:getFileSize
  describe('AssetsUtils.getFileSize', function () {
    // data.imageThumbTuple.forEach((entry) => {
    //     let image = entry.image;
    //     let thumb = entry.thumb;
    //     let thumbSuffix = entry.thumbSuffix
    //     it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
    //       AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
    //     });
    //   }
    // );
  });
  //TODO:removeDir
  describe('AssetsUtils.removeDir', function () {
    // data.imageThumbTuple.forEach((entry) => {
    //     let image = entry.image;
    //     let thumb = entry.thumb;
    //     let thumbSuffix = entry.thumbSuffix
    //     it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
    //       AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
    //     });
    //   }
    // );
  });

});



