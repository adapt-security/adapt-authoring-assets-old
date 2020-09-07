const AbstractApiModule = require('adapt-authoring-api');
const { App } = require('adapt-authoring-core');
const AssetsRepository = require('./assetsrepository');
const AssetsUtils = require('./assetsUtils');
const fs = require('fs-extra');
const importAudios = require('./importaudios');
const importImages = require('./importimages');
const importVideos = require('./importvideos');
const importZips = require('./importzips');
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
    tags.registerModule(this);

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
            importZips.bind(this),
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
    if(req.body) {
      this.find(req.body, {}).then(
        (results) => {
          if(req.params.size) {
            results = this.sortAssets(results, req.params.size)
          }
          res.status(200).json(results);
        }
      ).catch((e) => {
        res.status(500).send(e);
      });
    } else {
      this.retrieveAllAssets(req, res, next);
    }
  }

  retrieveAllAssets(req, res, next){
      this.find({}, {}).then(
        (results) => {
          res.status(200).json(results);
        }
      ).catch((e) => {
        res.status(500).send(e);
      });
  }

  importResponse(req, res, next) {
    if (Object.keys(req.fields).length === 0) {
      res.status(500).send(App.instance.lang.t('error.emptyfields'));
   } else {
      res.status(200).send(App.instance.lang.t('info.uploadsuccessful'));
   }
  }
  getAssetFilename(assets) {
    if (assets[0]) {
      return assets[0].path;
    } else {
      throw new Error(App.instance.lang.t('error.noasset'));
    }
  }
  getThumbnailFilename(assets) {
    if (assets[0]) {
      return AssetsUtils.getThumbPath(assets[0].path, this.thumbnailSuffix);
    } else {
      throw new Error(App.instance.lang.t('error.noasset'));
    }
  }
  /**
   * Get full path of an asset according to its name
   * @param {String} filename 
   */
  async getAssetFullPath(filename) {
    const exists = await this.repository.hasAsset(filename);
    if (exists) {
      return this.repository.fullPath(filename);
    } else {
      throw new Error(App.instance.lang.t('error.noasset'));
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
        res.status(500).send(App.instance.lang.t('error.noasset'));
      });
    };
  }
  /**
   * Get asset with or without Thumbnail
   */
  getAsset(req, res, next) {
    if (req.query.thumb === 'true') {
      this.retrieveThumbnail(req, res, next);
    } else {
      this.retrieveAsset(req, res, next);
    }
  }

/**
 * Retrieve asset by filtering options
 */
  retrieveAsset(req, res, next) {
    this.find({ "_id": req.params['id'] }, {})
      .then(this.getAssetFilename.bind(this))
      .then(this.getAssetFullPath.bind(this))
      .then(this.serveAsset(req, res, next)).catch((e) => {
        res.status(500).send(`${App.instance.lang.t('error.retrievingAsset')} ${e}`);
      });
  }
  // todo: in case of audio we may respond with an audio icon.
  // todo: in case of zip we may respond with a zip icon.
  retrieveThumbnail(req, res, next) {
    this.find({ "_id": req.params['id'] }, {})
      .then(this.getThumbnailFilename.bind(this))
      .then(this.getAssetFullPath.bind(this))
      .then(this.serveAsset(req, res, next)).catch((e) => {
        res.status(500).send(`${App.instance.lang.t('error.retrievingThumb')} ${e}`);
      });
  }
  updateAsset(req, res, next) {
    this.update({ "_id": req.params['id'] }, req.apiData.data).then(
      (result) => {
        res.status(200).send(result);
      }
    ).catch(
      (e) => {
        res.status(500).send(e);
      }
    );
  }
 /**
  * Sort the filtered Assets according to the size
  * @param {Array} assets Filtered asset
  * @param {String} option Sort option
  */
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
        ).catch((e) => {
            res.status(500).send(e);
          }
        );
      } else {
        res.status(500).send(`${App.instance.lang.t('error.norecord')} ${e}`);
      }
    };
    this.find({ "_id": req.params['id'] }).then(updateAsset).catch((e) => {
      res.status(500).send(e);
    });
  }
}
module.exports = Assetsmodule;
