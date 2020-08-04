const AbstractApiModule = require('adapt-authoring-api');
const validateAssets = require('./validateassets');
const importImages = require('./importimages');
const importAudios = require('./importaudios');
const importVideos = require('./importvideos');
const AssetsRepository = require('./assetsrepository');
const AssetsUtils = require('./assetsUtils');
const path = require('path');
const fs = require('fs-extra');
class Assetsmodule extends AbstractApiModule {
    /** @override */
    async setValues() {
            this.repository = new AssetsRepository(this.getConfig('uploadDir'));
            this.thumbnailSuffix = this.getConfig('thumbnailSuffix') || '_tn';
            this.thumbnailMaxWidth = this.getConfig('thumbnailMaxWidth') || 200;
            this.thumbnailMaxHeigt = this.getConfig('thumbnailMaxHeight') || 100;
            const acceptableTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'video/mp4']);
            const server = await this.app.waitForModule('server');
            this.root = 'assets';
            this.collectionName = 'assets';
            this.schemaName = 'assets';
            // const readPerms = [`read:${this.root}`]
            // const writePerms = [`write:${this.root}`]
            this.routes = [{
                    route: '/',
                    handlers: {
                        post: [validateAssets(acceptableTypes),
                            importImages.bind(this),
                            importAudios.bind(this),
                            importVideos.bind(this),
                            this.importResponse
                        ]
                    }
                },
                {
                    route: '/:id',
                    handlers: {
                        get: [this.retrieveAsset.bind(this)],
                        put: [this.updateAsset.bind(this)],
                        delete: [this.moveAssetToTrash.bind(this)]
                    }
                },
                {
                    route: '/serve/:id',
                    handlers: {
                        get: [this.serveSingleAsset.bind(this)]
                    }
                },
                {
                    route: '/query',
                    handlers: {
                        post: [this.indexResponse.bind(this)]
                    }
                }
            ];
        }
        /**
         * Initialise the module
         * @return {Promise}
         */
    async init() {
        await super.init();
        this.setReady();
    }

    indexResponse(req, res, next) {
        this.find({}, {}).then(
            (results) => {
                res.status(200).json(results);
            }
        ).catch((e) => {
            console.log(e);
            res.status(500).send('error ' + e)
        });
    }

    importResponse(req, res, next) {
        res.status(200).send('Done, OK...')
    }

    getAssetFilename(assets) {
        if (assets[0]) {
            return assets[0].path;
        } else {
            throw 'error'
        }
    }

    getThumbnailFilename(assets) {
        if (assets[0]) {
            return AssetsUtils.getThumbPath(assets[0].path, this.thumbnailSuffix);
        } else {
            throw 'error'
        }
    }

    async getAssetFullPath(filename) {
        let exists = await this.repository.hasAsset(filename);
        if (exists) {
            return this.repository.fullPath(filename);
        } else {
            throw 'asset not exists'
        }
    }

    (req, res, next) {
        return (fullPath) => {
            const type = AssetsUtils.mimetypeByExtension(path.extname(fullPath).slice(1)) || 'text/plain';
            let stream = fs.createReadStream(fullPath);
            stream.on('open', function() {
                res.set('Content-Type', type);
                stream.pipe(res);
            });
            stream.on('error', function() {
                res.set('Content-Type', 'text/plain');
                res.status(404).end('Not found');
            });
        }
    }

    serveSingleAsset(req, res, next) {
        console.log(req.params);
        if (req.params['thumb'] === true) {
            this.serveAsset(req, res, next);
        } else {
            this.getThumbnailFilename(req, res, next);
        }
    }

    retrieveAsset(req, res, next) {
        this.find({ "_id": req.params['id'] }, {})
            .then(this.getAssetFilename.bind(this))
            .then(this.getAssetFullPath.bind(this))
            .then(this.serveAsset(req, res, next)).catch((e) => {
                res.status(500).send(e.message);
            })
    }

    // todo: in case of audio we may respond with an audio icon.
    retrieveThumbnail(req, res, next) {
        this.find({ "_id": req.params['id'] }, {})
            .then(this.getThumbnailFilename.bind(this))
            .then(this.getAssetFullPath.bind(this))
            .then(this.serveAsset(req, res, next)).catch((e) => {
                res.status(500).send(e.message);
            });
    }

    updateAsset(req, res, next) {
        this.update({ "_id": req.params['id'] }, req.apiData.data).then(
            (result) => {
                res.status(200).send(result);
            }
        ).catch(
            (e) => {
                console.log(e);
                res.status(500).send('error ' + e);
            }
        );
    }

    /* toggle trash/restore of an asset */
    moveAssetToTrash(req, res, next) {
        let updateAsset = (records) => {
            if (records.length > 0) {
                this.update({ "_id": req.params['id'] }, { "_isDeleted": !records[0]["_isDeleted"] }).then(
                    (result) => {
                        console.log(result);
                        res.status(200).send(result)
                    }
                ).catch(
                    (e) => {
                        console.log(e);
                        res.status(500).send('error ')
                    }
                )
            } else {
                res.status(500).send('record not found error')
            }
        }
        this.find({ "_id": req.params['id'] }).then(updateAsset).catch((e) => {
            console.log(e)
            res.status(500).send('error')
        });
    }
}
module.exports = Assetsmodule;