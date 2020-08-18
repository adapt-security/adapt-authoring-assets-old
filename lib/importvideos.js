const FileProcessor = require('./fileprocessor');
const path = require('path');
const AssetsUtils = require('./assetsUtils');
const importVideos = function(req, res, next) {
    const importVideo = async(video) => {
        const filenameHash = await this.repository.save(video.path, video.type);
        const jsonschema = await this.app.waitForModule('jsonschema');
        const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
        const videoInRepositoryPath = path.join(this.repository.repositoryPath, AssetsUtils.nameToPath(filenameHash));

        const videoPoster = await fileProcessor.createVideoPoster(videoInRepositoryPath);
        const thumbnail = await fileProcessor.createVideoThumbnail(videoInRepositoryPath);
        const metadata = await fileProcessor.retrieveMediaMetadata(video.path);

        let defaults = {};
        jsonschema.applyDefaults('assets', data = {
                "path": filenameHash,
                "type": 'video',
                "poster": videoPoster
            })
            .then(m => defaults = m)
            .catch(e => res.send(e));


        const result = await this.insert(Object.assign(defaults, req.fields, { metadata: metadata }), {});
        return result;
    };
    if (req.videos && req.videos.length) {
        Promise.all(req.videos.map(importVideo)).then(() => {
            next();
        }).catch((e) => {
            res.status(500).send(e.message);
        });
    } else {
        next();
    }
};
module.exports = importVideos;