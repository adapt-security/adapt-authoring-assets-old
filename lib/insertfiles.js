const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');

const insertfiles = function (file, fields = {}) {
  const insertImage = async (file, fields) => {
    const filenameHash = await this.repository.save(file.path, file.type);
    const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);

    await fileProcessor.createImageThumb(this.repository.fullPath(filenameHash));

    return this.insert(Object.assign(fields, {
      "path": filenameHash,
      "type": "image",
      "size": AssetsUtils.getFileSize(file.path),
    }));
  };
  const insertAudio = async (file, fields) => {
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
        throw new Error(err)
      });

    const fileProcessor = new FileProcessor();
    const metadata = await fileProcessor.retrieveMediaMetadata(file.path);

    return await this.insert(Object.assign(defaults, fields, { metadata: metadata }), {});
  };

  const insertVideo = async (file, fields) => {
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
      .catch((err) => {
        throw new Error(err)
      });

    await fileProcessor.createVideoThumbnail(videoInRepositoryPath);
    const metadata = await fileProcessor.retrieveMediaMetadata(file.path);
    const record = await this.insert(Object.assign(defaults, fields, { metadata: metadata }), {});
    return record;
  };

  const insertZip = async (file, fields) => {
    const filenameHash = await this.repository.save(file.path, file.type);
    const defaults = {
      "path": filenameHash,
      "type": "zip",
      "size": AssetsUtils.getFileSize(file.path),
    };

    const record = await this.insert(Object.assign(defaults, fields, { metadata: {} }), {});
    return record;
  };

  const files = file.length ? file : [file];
  let records = [];
  files.forEach((f) => {
    const [type] = f.type.split('/');
    let record;
    try {
      if (type === 'audio') {
        record = insertAudio(f, fields);
      } else if (type === 'image') {
        record = insertImage(f, fields);
      } else if (type === 'video') {
        record = insertVideo(f, fields);
      } else if (f.type === 'application/zip') {
        record = insertZip(f, fields);
      }
      if (record) records.push(record);
    } catch (error) {
      console.log(error);
    }
  });
  console.log('1111111111111111111111111111' + records.length)
  return records;
};

module.exports = insertfiles;