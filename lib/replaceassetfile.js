import { App } from 'adapt-authoring-core';
import FileProcessor from "./fileprocessor";
import formidable from "formidable";
import path from 'path';
/**
   * Replace sinle asset File
  */
export default async function replaceAssetFile(req, res, next) {
  const acceptableTypes = new Set(this.getConfig("acceptableTypes"));
  const asset = await this.find({ _id: req.params["_id"] }, {});
  //If no asset is found
  if(!asset[0] || asset[0] === {}) {
    res.status(500).send(App.instance.lang.t("error.noassetsfound"))
    return;
  }
  const self = this;
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(new Error(App.instance.lang.t("error.failedparsing")));
    }
    for (const file of Object.values(files)) {
      //If user uploaded different type of asset, will return error message
      if (asset[0].type && !file.type.includes(asset[0].type)) {
        res.messages = res.messages || [];
        res.status(500).send(App.instance.lang.t("error.notsamefiletype"));
        return;
      }
      if (file && !file.length) {
        try {
          req.apiData.data = await createNewDBData(file.type, file, req.apiData.query);
          this.updateAsset(req, res, next);
        } catch(e) {
          next(e);
        }
      }
    }
    //This function will create new object to update record in mongodb
    async function createNewDBData(fileType, file, data) {
      const newObject = { ...data };
      //save file to repository
      const filename = await self.repository.save(file.path, fileType);
      const fileProcessor = new FileProcessor(self.thumbnailSuffix, self.thumbnailMaxWidth, self.thumbnailMaxHeigt); 
      //update Database record
      if (acceptableTypes.has(fileType)) {
        switch (fileType) {
          case "image/jpeg":
          case "image/png":
          case "image/gif":
            //if images will re-generate thumbnail image
            fileProcessor.createImageThumb(self.repository.fullPath(filename));
            newObject.path = filename;
            newObject.size = file.size;
            break;
          case "audio/mpeg":
            //if video will re-generate metadata
            const audiometadata = await fileProcessor.retrieveMediaMetadata(file.path);
            newObject.path = filename;
            newObject.size = file.size;
            newObject.metadata = audiometadata;
            break;
          case "video/mp4":
            //if video will re-generate video thumbnail, poster image and metadata
            const videometadata = await fileProcessor.retrieveMediaMetadata(file.path);
            // eslint-disable-next-line max-len
            const videoInRepositoryPath = path.join(self.repository.repositoryPath, filename);
            const videoPoster = await fileProcessor.createVideoPoster(videoInRepositoryPath);
            await fileProcessor.createVideoThumbnail(videoInRepositoryPath);
            newObject.path = filename;
            newObject.size = file.size;
            newObject.metadata = videometadata;
            newObject.poster = videoPoster;
            break;
          case "application/zip":
            newObject.path = filename;
            newObject.size = file.size;
            break;
        }
      }
      return newObject;
    } 
  });
}
