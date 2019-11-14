const AbstractApiModule = require('adapt-authoring-api');
const AssetSchema = require('../schema/asset.schema.js');
const AssetMiddleware = require('./assetMiddleware');

/**
* Abstract module which handles course assets
* @extends {AbstractApiModule}
*/
class AssetApiModule extends AbstractApiModule {
  /** @override */
  static get def() {
    return {
      name: 'assets',
      model: 'asset',
      schemas: [ AssetSchema ],
      routes: [
        {
          route: '/:id?',
          handlers: {
            post: AssetMiddleware.postAsset.bind(this),
            get: AbstractApiModule.requestHandler(),
            put: AssetMiddleware.putAsset.bind(this),
            delete:AssetMiddleware.deleteAsset.bind(this)
          }
        }
      ]
    };
  }
}

module.exports = AssetApiModule;
