const FileProcessor = require('./fileprocessor');

const importAudios = function(req, res, next) {
    const importAudio = async(audio) => {
        let filenameHash = await this.repository.save(audio.path, audio.type);
        const jsonschema = await this.app.waitForModule('jsonschema');

        let defaults = {};
        jsonschema.applyDefaults('assets', data = {
                "path": filenameHash,
                "type": 'audio',
            })
            .then(m => defaults = m)
            .catch(e => res.send(e));

        let fileProcessor = new FileProcessor();
        let metadata = await fileProcessor.retrieveMediaMetadata(audio.path)

        const result = await this.insert(Object.assign(defaults, req.fields, { metadata: metadata }), {});
        return result;
    }
    if (req.audios && req.audios.length) {
        Promise.all(req.audios.map(importAudio)).then(() => {
            next()
        }).catch((e) => {
            res.status(500).send(e.message);
        });
    } else {
        next();
    }
};

module.exports = importAudios;