const path = require('path');
const sharp = require('sharp');
const platform = require('os').platform();
const ptMaps = { 'win32': 'win.exe', 'darwin': 'mac', 'linux': 'linux' };
const ffProbeBin = `${require.resolve('util-ffprobe').replace(/index\.js$/, '')}util-ffprobe-${ptMaps[platform]}`;
const ffMpegBin = `${require.resolve('util-ffmpeg').replace(/index\.js$/, '')}util-ffmpeg-${ptMaps[platform]}`;
const fluentFfmpeg = require('fluent-ffmpeg');
fluentFfmpeg.setFfmpegPath(ffMpegBin);
fluentFfmpeg.setFfprobePath(ffProbeBin);
const VideoThumbnailGenerator = require('video-thumbnail-generator').default;
const should = require('should');
const fs = require('fs-extra');
const FileProcessor = require('./../lib/fileprocessor');
const data = require('./data/data');

describe('Asset Module FileProcessor', function () {
  const fileProcessor = new FileProcessor();
  describe('#createImageThumb', function () {
    data.sampleFilesTuple.forEach((entry) => {
      const filepath = entry.filepath;
      if(entry.extension !== 'jpg' || entry.extension !== 'png' || entry.extension !== 'gif') return;
      it(`should return Promise createImageThumb Function`, function () {
        fileProcessor.createImageThumb(filepath).should.be.a.Promise();
      });
    });
  });
  describe('#createVideoThumbnail', function () {
    data.sampleFilesTuple.forEach((entry) => {
      const filepath = entry.filepath;
      if(entry.extension !== 'mp4') return;
      it(`should return Promise createVideoThumbnail Function`, function () {
        fileProcessor.createVideoThumbnail(filepath).should.be.a.Promise();
      });
    });
  });
  describe('#createVideoPoster', function () {
    data.sampleFilesTuple.forEach((entry) => {
      const filepath = entry.filepath;
      if(entry.extension !== 'mp4') return;
      it(`should return Promise createVideoThumbnail Function`, function () {
        fileProcessor.createVideoPoster(filepath).should.be.a.Promise();
      });
    });
  });
});


