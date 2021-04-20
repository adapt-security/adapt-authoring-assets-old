const AssetsUtils = require('./assetsUtils');
const fs = require('fs-extra');
const mime = require("mime");
const decompress = require("decompress");

const importZips =  function(req, res, next) {
  const importZip = async (zip) => {
    const filenameHash = await this.repository.save(zip.path, zip.type);
    const defaults = {
      "path": filenameHash,
      "type": "zip",
      "size": AssetsUtils.getFileSize(zip.path),
    };
    const result = await this.insert(Object.assign(defaults, req.fields, { metadata: {} }), {});
    return result;
  };

  const unZip = async (zip) => {
    try {
      const hash = await AssetsUtils.getHash(zip.path);
      //dir where the files from zip file extract to
      const extractDir = `${this.getConfig("uploadTempDir")}/${hash}`;
      fs.ensureDir(extractDir, (err) => {
        return new Error(`Failed to create folder`);
      });

      const files = await decompress(zip.path, extractDir);
      const acceptableTypes = new Set(this.getConfig("acceptableTypes"));

      files.forEach((file) => {
        const fileType = mime.getType(file.path);
        const filepath = `${this.app.getConfig("rootDir")}/${extractDir}/${file.path}`;
        const importedFile = { path: filepath, type: fileType };
        if(acceptableTypes.has(fileType)) {
          switch(fileType) {
            case "image/jpeg":
            case "image/png":
            case "image/gif":
              req.images.push(importedFile);
              break;
            case "audio/mpeg":
              req.audios.push(importedFile);
              break;
            case "video/mp4":
              req.videos.push(importedFile);
              break;
            case "application/zip":
              req.zips.push(importedFile);
          }
        } else {
          res.messages = res.messages || [];
          res.messages.push(`filetype %{filetype} not supported`);
        }
      });
    } catch(err) {
      return new Error(`Failed to create folder`);
    }
  };

  //if unzip parameter is specified will unzip the zip file
  if(req.query.unzip === "true" && req.zips.length) {
    Promise.all(req.zips.map(unZip)).then(() => {
      return next();
    }).catch((e) => {
      res.status(500).send(e);
    });
  //if unzip parameter is not specified will import zip file as single assets
  } else if(req.zips && req.zips.length) {
    Promise.all(req.zips.map(importZip)).then((results) => {
      if(results) req.results = [].concat(req.results, results);
      return next();
    }).catch((e) => {
      res.status(500).send(e);
    });
  } else {
    return next();
  }
};

module.exports = importZips;