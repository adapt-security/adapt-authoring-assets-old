const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');


const insertFile = async function (file, fields = {}) {
  const files = file.length ? file : [file];
  files.forEach(async (f) => {
    const [type] = f.type.split('/');
    if (type === 'audio') {
     await insertAudio(file, fields)
    } else if (type === 'image') {
      await insertImage(file, fields)
    } else if (type === 'video') {
      await insertVideo(file, fields)
    } else if (f.type === 'application/zip') {
      await insertZip(file, fields)
    }
  });

  const insertImage = async function (file, fields) {
    const filenameHash = await this.repository.save(file.path, file.type);
    const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);

    await fileProcessor.createImageThumb(this.repository.fullPath(filenameHash));

    return this.insert(Object.assign(fields,  {
      "path": filenameHash,
      "type": "image",
      "size": AssetsUtils.getFileSize(file.path),
    }));
  };
  const insertAudio = async function (file, fields) {
    const filenameHash = await this.repository.save(file.path, file.type);
    const jsonschema = await this.app.waitForModule('jsonschema');
    let defaults = {};
    jsonschema
      .applyDefaults(this.schemaName, {
        "path": filenameHash,
        "type": "audio",
        "size": AssetsUtils.getFileSize(file.path)
      })
      .then((m) => defaults = m)
      .catch((e) => {
        //TODO:error handling
      });

    const fileProcessor = new FileProcessor();
    const metadata = await fileProcessor.retrieveMediaMetadata(file.path);

    const result = await this.insert(Object.assign(defaults, fields, { metadata: metadata }), {});
    return result;
  };

  const insertVideo = async function (file, fields) {
    const filenameHash = await this.repository.save(file.path, file.type);
    const jsonschema = await this.app.waitForModule('jsonschema');
    const videoInRepositoryPath = path.join(this.repository.repositoryPath, AssetsUtils.nameToPath(filenameHash));
    const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
    const videoPoster = await fileProcessor.createVideoPoster(videoInRepositoryPath);

    let defaults = {};
    jsonschema
      .applyDefaults(this.schemaName, {
        "path": filenameHash,
        "type": "video",
        "poster": videoPoster,
        "size": AssetsUtils.getFileSize(file.path),
      })
      .then((m) => defaults = m)
      .catch((e) => {
        //TODO:error handling
      });

    await fileProcessor.createVideoThumbnail(videoInRepositoryPath);
    const metadata = await fileProcessor.retrieveMediaMetadata(file.path);

    const result = await this.insert(Object.assign(defaults, fields, { metadata: metadata }), {});
    return result;
  };

  const insertZip = async function (file, fields) {
    const filenameHash = await this.repository.save(file.path, file.type);
    const defaults = {
      "path": filenameHash,
      "type": "zip",
      "size": AssetsUtils.getFileSize(file.path),
    };
    const result = await this.insert(Object.assign(defaults, fields, { metadata: {} }), {});
    return result;
  };
}

module.exports = insertFile;