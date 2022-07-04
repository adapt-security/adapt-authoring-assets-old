import AssetsUtils from './assetsUtils.js';
import fs from 'fs-extra';
import mime from "mime";
import path from 'path'
import { unzip } from 'zipper';;

export default function importZips(req, res, next) {
  const importZip = async (zip) => {
    const filename = await this.repository.save(zip);
    const defaults = {
      "id": objectId,
      "path": filename,
      "type": "zip",
      "size": AssetsUtils.getFileSize(zip.filepath),
    };
    try {
      const result = await this.insert(Object.assign(defaults, req.apiData.data, req.fields, { metadata: {} }), {});
      const newFilePath = await this.repository.rename(filename, zip.mimeype, result._id);
      //update db info
      return await this.update({ _id: result._id }, { 'path': newFilePath });
    } catch (e) {
      //clears up the asset file at failure of database insert 
      const filepath = filename;
      const hasMultiPointer = await this.hasMultiPointer(filename)
      if (!hasMultiPointer) {
        await this.deleteFile(path.join(this.repositoryPath, filepath), 'zip');
      }
      return next(e);
    }
  };
  const unZip = async (zip) => {
    try {
      //FIXME: this should be refactored according to the new file structure
      const hash = await AssetsUtils.getHash(zip.filepath);
      //dir where the files from zip file extract to
      const extractDir = `${this.getConfig("uploadTempDir")}/${hash}`;
      fs.ensureDir(extractDir, (e) => {
        return new Error(`Failed to create folder - ${e.message}`);
      });
      await unzip(zip.filepath, extractDir);
      
      const acceptableTypes = new Set(this.getConfig("acceptableTypes"));
      const files = await fs.readdir(extractDir);

      files.forEach((file) => {
        const fileType = mime.getType(file);
        const filepath = `${this.app.rootDir}/${extractDir}/${file}`;
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