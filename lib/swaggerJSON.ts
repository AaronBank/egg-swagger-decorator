import * as _ from 'lodash';
import init from './swaggerTemplate';
import { getPath } from './utils';
/**
 * build swagger json from apiObjects
 */
const swaggerJSON = (options = {}, apiObjects) => {
  const title = options['title'];
  const description = options['description'];
  const version = options['version'];
  const prefix = options['prefix'] || '';
  const swaggerOptions = options['swaggerOptions'] || {};

  const swaggerJSON = init(title, description, version, swaggerOptions);

  _.chain(apiObjects)
    .forEach((value) => {
      if (!Object.keys(value).includes('request')) { throw new Error('missing [request] field'); }

      const { method } = value.request;
      let { path } = value.request;
      path = getPath(prefix, path); // 根据前缀补全path
      const summary = value.summary
        ? value.summary
        : '';
      const description = value.description
        ? value.description
        : summary;
      const responses = value.responses
        ? value.responses
        : {
          200: {
            description: 'success'
          }
        };
      const {
        query = [],
        path: pathParams = [],
        body = [],
        tags,
        formData = [],
        security,
      } = value;

      const parameters = [
        ...pathParams,
        ...query,
        ...formData,
        ...body,
      ];

      // init path object first
      if (!swaggerJSON.paths[path]) { swaggerJSON.paths[path] = {}; }

      // add content type [multipart/form-data] to support file upload
      const consumes = formData.length > 0
        ? ['multipart/form-data']
        : undefined;

      swaggerJSON.paths[path][method] = {
        consumes,
        summary,
        description,
        parameters,
        responses,
        tags,
        security
      };
    }).value();
  return swaggerJSON;
};

export default swaggerJSON;
