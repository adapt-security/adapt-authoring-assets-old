const AbstractApiModule = require('adapt-authoring-api');
const AssetSchema = require('../schema/asset.schema.js');
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
          route: '/:_id?',
          handlers: ['post','get','put','delete']
        }
      ]
    };
  }
}

module.exports = AssetApiModule;
