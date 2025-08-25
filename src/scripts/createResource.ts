/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-process-exit */
import handleBars from 'handlebars';
import fs from 'node:fs';
import path from 'path';
import { program } from 'commander';

handleBars.registerHelper('lowerCase', (str) => str?.toLowerCase() || '');
handleBars.registerHelper('upperFirst', (str) => str.charAt(0).toUpperCase() + str.slice(1));
handleBars.registerHelper('camelCase', (str) => str.charAt(0).toLowerCase() + str.slice(1));

interface TemplateData {
  entity: string;
  pkField: string;
  entityPath: string;
  serviceType?: string | undefined;
}

type TemplateMap = Record<
  string,
  {
    folder: string;
    template: (data: TemplateData) => string;
  }
>;

const templateOptions: TemplateMap = {
  repository: {
    folder: 'repositories',
    template: handleBars.compile(`import { AppDataSource } from '{{#if serviceType}}../../{{else}}../{{/if}}data-source';
import { {{entity}} } from '{{#if serviceType}}../../{{else}}../{{/if}}entities/{{entityPath}}';

export default AppDataSource.getRepository({{entity}}).extend({});
`)
  },
  service: {
    folder: 'services',
    template:
      handleBars.compile(`import type { {{entity}} } from '{{#if serviceType}}../../{{else}}../{{/if}}entities/{{entityPath}}';
import {{camelCase entity}}Repository from '{{#if serviceType}}../{{/if}}../repositories/{{#if serviceType}}{{serviceType}}/{{/if}}{{camelCase entity}}.repository';
import { BaseService } from '{{#if serviceType}}../{{else}}../{{/if}}shared/base.service';

class {{entity}}Service extends BaseService<{{entity}}> {}

export default new {{entity}}Service({{camelCase entity}}Repository, '{{pkField}}');
`)
  },
  controller: {
    folder: 'controller',
    template:
      handleBars.compile(`import {{camelCase entity}}Service from '{{#if serviceType}}../{{/if}}../services/{{#if serviceType}}{{serviceType}}/{{/if}}{{camelCase entity}}.service';
import { BaseController } from '{{#if serviceType}}../{{else}}../{{/if}}shared/base.controller';
import type { {{entity}} } from '{{#if serviceType}}../../{{else}}../{{/if}}entities/{{entityPath}}';

class {{entity}}Controller extends BaseController<{{entity}}> {}

export default new {{entity}}Controller({{camelCase entity}}Service);
`)
  },
  router: {
    folder: 'routes/v1',
    template: handleBars.compile(`import { Router } from 'express';
import {{camelCase entity}}Controller from '{{#if serviceType}}../../../{{else}}../../../{{/if}}controller/{{#if serviceType}}{{serviceType}}/{{/if}}{{camelCase entity}}.controller';
import { addCrudOperationsToRouter } from '{{#if serviceType}}../../../{{else}}../../../{{/if}}utils/route.utils';

const {{camelCase entity}}Router = Router();
addCrudOperationsToRouter({{camelCase entity}}Router, {{camelCase entity}}Controller);

export default {{camelCase entity}}Router;
`)
  }
};

const serviceTypes = [
  'build-master',
  'customer-and-supplier',
  'form-utilities',
  'manager-portal',
  'order-processing',
  'settings',
  'shared',
  'stock-and-offer',
  'utilities'
];

const getPath = (entity: string, type: string, serviceType: string | undefined) => {
  const baseFolder = 'src';
  let folder = templateOptions[type]?.folder as string;

  if (serviceType) {
    if (type === 'repository' || type === 'service' || type === 'controller') {
      folder = path.join(folder, serviceType);
    } else if (type === 'router') {
      folder = path.join(folder, serviceType);
    }
  }

  const fileName =
    type === 'router'
      ? `${entity.charAt(0).toLowerCase() + entity.slice(1)}.routes.ts`
      : `${entity.charAt(0).toLowerCase() + entity.slice(1)}.${type}.ts`;

  return path.join(baseFolder, folder, fileName);
};

function findEntityFile(entity: string): string | null {
  const baseDir = 'src/entities';

  function searchRecursively(dir: string): string | null {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const result = searchRecursively(filePath);
        if (result) return result;
      } else if (file === `${entity}.ts`) {
        return filePath;
      }
    }

    return null;
  }

  return searchRecursively(baseDir);
}

function getEntityPath(entityFile: string): string {
  const parts = entityFile.split(path.sep);
  const entitiesIndex = parts.indexOf('entities');
  return parts
    .slice(entitiesIndex + 1)
    .join('/')
    .replace('.ts', '');
}

function createResource(
  entity: string,
  pkField: string,
  serviceType: string | undefined,
  options: Record<string, boolean>
): void {
  if (!Object.keys(options).length) {
    options = { repository: true, service: true, controller: true, router: true };
  }

  if (serviceType && !serviceTypes.includes(serviceType)) {
    console.error(`Invalid service type. Must be one of: ${serviceTypes.join(', ')}`);
    process.exit(1);
  }

  const entityFile = findEntityFile(entity);
  if (!entityFile) {
    console.error(`Entity ${entity} does not exist in entities folder`);
    process.exit(1);
  }

  console.log(`Found entity file: ${entityFile}`);
  const entityPath = getEntityPath(entityFile);

  Object.keys(options).forEach((option) => {
    const filePath = getPath(entity, option, serviceType);

    if (!fs.existsSync(filePath)) {
      // eslint-disable-next-line security/detect-object-injection
      const template = templateOptions[option]?.template;

      if (!template) return;

      try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        const templateData: TemplateData = { entity, pkField, entityPath, serviceType };
        fs.writeFileSync(filePath, template(templateData));
        console.log(`Created ${option} for ${entity} at ${filePath}`);
      } catch (e) {
        console.error(`Failed to create ${option} for ${entity}`);
        console.error((e as Error).message);
      }
    } else {
      console.log(`${option} already exists for ${entity} at ${filePath}`);
    }
  });
}

program
  .argument('<entity>', 'Entity name')
  .argument('<pkField>', 'Primary key field name')
  .argument('[type]', 'Service type')
  .action((entity, pkField, type) => {
    console.log('Received arguments:', { entity, pkField, type });

    const resourceOptions = {
      service: true,
      repository: true,
      controller: true,
      router: true
    };

    console.log('Processed options:', { type, resourceOptions });
    createResource(entity, pkField, type, resourceOptions);
  });

program.parse(process.argv);
