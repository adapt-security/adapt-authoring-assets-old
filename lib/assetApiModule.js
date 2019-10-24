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
      schema: [ AssetSchema ],
      routes: [
        {
          route: '/:_id?',
          handlers: ['post','get','put','delete']
        }
      ]
    };
  }

  /** @override */
  boot(app, resolve, reject) {
    super.boot(app, () => {
      const db = this.app.getModule('mongodb');
      db.isConnected ? this.addSchema() : db.on('boot', this.addSchemas.bind(this));
      resolve();
    }, reject);
  }

  /**
  * Add the  asset model
  */
  addSchema() {
    try {
      const db = this.app.getModule('mongodb');
      db.addModel(AssetSchema);
    } catch(e) {
      return this.log('warn', `${this.app.lang.t('error.schemaerror')}, ${e}`);
    }
  }

}

module.exports = AssetApiModule;
