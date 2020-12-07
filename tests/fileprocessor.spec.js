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

describe('FileProcessor', function () {
  const fileProcessor = new FileProcessor();

  describe('FileProcessor.createImageThumb', function () {
    data.sampleFilesTuple.forEach((entry) => {
      if(entry.extension !== 'jpg' || entry.extension !== 'png' || entry.extension !== 'gif') return;
      const filepath = entry.filepath;
      it(`should return Promise createImageThumb Function`, function () {
        fileProcessor.createImageThumb(filepath).should.be.a.Promise()
      });
    });
  });
  describe('FileProcessor.createVideoThumbnail', function () {
    data.sampleFilesTuple.forEach((entry) => {
      if(entry.extension !== 'mp4') return;
      const filepath = entry.filepath;
      it(`should return Promise createVideoThumbnail Function`, function () {
        fileProcessor.createVideoThumbnail(filepath).should.be.a.Promise();
    });
  });
});
});


