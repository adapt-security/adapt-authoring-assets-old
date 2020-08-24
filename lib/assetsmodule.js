const AbstractApiModule = require('adapt-authoring-api');
const AssetsRepository = require('./assetsrepository');
const AssetsUtils = require('./assetsUtils');
const fs = require('fs-extra');
const importAudios = require('./importaudios');
const importImages = require('./importimages');
const importVideos = require('./importvideos');
const path = require('path');
const validateAssets = require('./validateassets');
/**
* Asset management module
*/
class Assetsmodule extends AbstractApiModule {
  /** @override */
  async setValues() {
    this.repository = new AssetsRepository(this.getConfig('uploadDir'));
    this.thumbnailSuffix = this.getConfig('thumbnailSuffix');
    this.thumbnailMaxWidth = this.getConfig('thumbnailMaxWidth');
    this.thumbnailMaxHeigt = this.getConfig('thumbnailMaxHeight');

    this.root = 'assets';
    this.collectionName = 'assets';
    this.schemaName = 'assets';

    const [authored, tags] = await this.app.waitForModule('authored', 'tags');
    authored.registerModule(this);
    // tags.registerModule(this);

    const acceptableTypes = new Set(this.getConfig('acceptableTypes'));
    const readPerms = [`read:${this.root}`];
    const writePerms = [`write:${this.root}`];

    this.routes = [
      {
        route: '/',
        handlers: {
          post: [validateAssets(acceptableTypes),
            importImages.bind(this),
            importAudios.bind(this),
            importVideos.bind(this),
            this.importResponse
          ]
        },
        permissions: { post: writePerms }
      },
      {
        route: '/:id',
        handlers: {
          put: [this.updateAsset.bind(this)],
          delete: [this.moveAssetToTrash.bind(this)]
        },
        permissions: { get: readPerms, put: writePerms, delete: writePerms }
      },
      {
        route: '/serve/:id',
        handlers: {
          get: [this.getAsset.bind(this)]
        },
        permissions: { get: readPerms }
      },
      {
        route: '/query',
        handlers: {
          post: [this.indexResponse.bind(this)]
        },
        permissions: { post: writePerms }
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
    if (req.body) {
      //sort assets by size
      if(req.body.size) {
        this.find({}, {}).then(
          (results) => {
              res.status(200).json(this.sortAssets(results, req.body.size));
          }
        ).catch((e) => {
          res.status(500).send(`error ${e}`);
        });
      } else {
        this.find(req.body, {}).then(
          (results) => {
            if (req.body.size) {
              console.log(req.body.size)
              res.status(200).json(results);
            }
            res.status(200).json(results);
          }
        ).catch((e) => {
          res.status(500).send(`error ${e}`);
        });
      }
    } else {
      retreiveAllAssets(req, res, next);
    }
  }

  retreiveAllAssets(req, res, next){
      this.find({}, {}).then(
        (results) => {
          res.status(200).json(results);
        }
      ).catch((e) => {
        res.status(500).send(`error ${e}`);
      });
  }

  importResponse(req, res, next) {
    if (Object.keys(req.fields).length === 0) {
     res.status(500).send('The fields are empty.');
   } else {
     res.status(200).send('Done, OK...');
   }
  }
  getAssetFilename(assets) {
    if (assets[0]) {
      return assets[0].path;
    } else {
      throw new Error('No asset is found');
    }
  }
  getThumbnailFilename(assets) {
    if (assets[0]) {
      return AssetsUtils.getThumbPath(assets[0].path, this.thumbnailSuffix);
    } else {
      throw new Error('No asset is found');
    }
  }
  async getAssetFullPath(filename) {
    const exists = await this.repository.hasAsset(filename);
    if (exists) {
      return this.repository.fullPath(filename);
    } else {
      throw new Error('No asset is found');
    }
  }
  serveAsset(req, res, next) {
    return (fullPath) => {
      const type = AssetsUtils.mimetypeByExtension(path.extname(fullPath).slice(1)) || 'text/plain';
      const stream = fs.createReadStream(fullPath);
      stream.on('open', function() {
        res.set('Content-Type', type);
        stream.pipe(res);
      });
      stream.on('error', function() {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
      });
    };
  }
  getAsset(req, res, next) {
    if (req.query.thumb === 'true') {
      this.retrieveThumbnail(req, res, next);
    } else {
      this.retrieveAsset(req, res, next);
    }
  }
  retrieveAsset(req, res, next) {
    this.find({ "_id": req.params['id'] }, {})
      .then(this.getAssetFilename.bind(this))
      .then(this.getAssetFullPath.bind(this))
      .then(this.serveAsset(req, res, next)).catch((e) => {
        res.status(500).send(e.message);
      });
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
        res.status(500).send(`error ${ e}`);
      }
    );
  }
  sortAssets(assets, option) {
    if (option === "descending") {
      assets.sort((a, b) => {
        return b.size - a.size;
      });
    } else if (option === "ascending") {
      assets.sort((a, b) => {
        return a.size - b.size;
      });
    }
    return assets;
  }
  /* toggle trash/restore of an asset */
  moveAssetToTrash(req, res, next) {
    const updateAsset = (records) => {
      if (records.length > 0) {
        this.update({ "_id": req.params['id'] }, { "_isDeleted": !records[0]["_isDeleted"] }).then(
          (result) => {
            res.status(200).send(result);
          }
        ).catch(
          (e) => {
            res.status(500).send('error ');
          }
        );
      } else {
        res.status(500).send('record not found error');
      }
    };
    this.find({ "_id": req.params['id'] }).then(updateAsset).catch((e) => {
      res.status(500).send('error');
    });
  }
}
module.exports = Assetsmodule;