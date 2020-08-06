const FileProcessor = require('./fileprocessor');
const path = require('path');
const AssetsUtils = require('./assetsUtils');
const importVideos = function(req, res, next) {
    const importVideo = async(video) => {
        let filenameHash = await this.repository.save(video.path, video.type);
        let fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
        let videoInRepositoryPath = path.join(this.repository.repositoryPath, AssetsUtils.nameToPath(filenameHash));
        let metadata = await fileProcessor.retrieveMediaMetadata(video.path)
        let thumbnail = await fileProcessor.createVideoThumbnail(videoInRepositoryPath);

        const jsonschema = await this.app.waitForModule('jsonschema');
        let defaults = {};
        jsonschema.applyDefaults('assets', data = {
                "path": filenameHash,
                "type": 'video',
                "createdAt": (new Date()).toString()
            })
            .then(m => defaults = m)
            .catch(err => res.send(err));

        const result = await this.insert(Object.assign(defaults, req.fields, { metadata: metadata }), {});
        return result;
    }
    if (req.videos && req.videos.length) {
        Promise.all(req.videos.map(importVideo)).then(() => {
            next()
        }).catch((e) => {
            res.status(500).send(e.message);
        });
    } else {
        next();
    }
};
module.exports = importVideos;