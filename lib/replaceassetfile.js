const formidable = require("formidable");
const FileProcessor = require("./fileprocessor");
const { App } = require('adapt-authoring-core');

/**
   * Replace sinle asset File
  */
module.exports = async function replaceAssetFile(req, res, next){
  const acceptableTypes = new Set(this.getConfig("acceptableTypes"));
  const asset = await this.find({ _id: req.params["_id"] }, {});
  //If no asset is found
  if(!asset[0] || asset[0] === {}) {
    res.status(500).send(App.instance.lang.t("error.noassetsfound"))
    return;
  }
  const self = this;
  const form = formidable({ multiples: false });
  form.parse(req, (err, fields, files) => {
    if (err) {
      const e = new Error(App.instance.lang.t("error.failedparsing"));
      res.status(500).send(e);
      return;
    }
    for (const file of Object.values(files)) {
    //If user uploaded different type of asset, will return error message
      if (asset[0].type && !file.type.includes(asset[0].type)) {
        res.messages = res.messages || [];
        res.status(500).send(App.instance.lang.t("error.notsamefiletype"));
        return;
      }
      if (file && !file.length) {
        createNewDBData(file.type, file, res)
          .then((newDBData) => {
            if(newDBData && newDBData !== {}) {
              this.update({ _id: req.params["_id"] }, newDBData)
                .then(result =>res.status(200).send(result))
                .catch(err =>res.status(500).send(err));
            } 
          })
          .catch(err =>res.status(500).send(err));
      }
    }
    //This function will create new object to update record in mongodb
    async function createNewDBData(fileType, file) {
      const newObject = {};
      //save file to repository
      const filenameHash = await self.repository.save(file.path, fileType);
      const fileProcessor = new FileProcessor(self.thumbnailSuffix, self.thumbnailMaxWidth, self.thumbnailMaxHeigt); 
      //update Database record
      if (acceptableTypes.has(fileType)) {
        switch (fileType) {
          case "image/jpeg":
          case "image/png":
          case "image/gif":
            //if images will re-generate thumbnail image
            fileProcessor.createImageThumb(self.repository.fullPath(filenameHash));
            newObject.path = filenameHash;
            newObject.size = file.size;
            break;
          case "audio/mpeg":
            //if video will re-generate metadata
            const audiometadata = await fileProcessor.retrieveMediaMetadata(file.path);
            newObject.path = filenameHash;
            newObject.size = file.size;
            newObject.metadata = audiometadata;
            break;
          case "video/mp4":
            //if video will re-generate video thumbnail, poster image and metadata
            const videometadata = await fileProcessor.retrieveMediaMetadata(file.path);
            // eslint-disable-next-line max-len
            const videoInRepositoryPath = path.join(self.repository.repositoryPath, AssetsUtils.nameToPath(filenameHash));
            const videoPoster = await fileProcessor.createVideoPoster(videoInRepositoryPath);
            await fileProcessor.createVideoThumbnail(videoInRepositoryPath);
            newObject.path = filenameHash;
            newObject.size = file.size;
            newObject.metadata = videometadata;
            newObject.poster = videoPoster;
            break;
          case "application/zip":
            newObject.path = filenameHash;
            newObject.size = file.size;
            break;
        }
      }
      return newObject;
    } 
  });
}
