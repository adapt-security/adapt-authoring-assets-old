const AbstractApiModule = require('adapt-authoring-api');
/**
* Abstract module which handles course assets
* @extends {AbstractApiModule}
*/
class AssetApiModule extends AbstractApiModule {
  /** @override */
  static get def() {
    return {
      name: 'assets',
      schema: 'asset',
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
