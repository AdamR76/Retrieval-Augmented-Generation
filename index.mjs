import fs from 'fs/promises';
import { join } from 'path';
import pgsqlConfig from './pgsql.config.mjs';
import postgres from '../coding/postgres.mjs';

const flow = (...args) => args.reduce((prev, next) => Promise.resolve(prev).then(next)),
	waitAll = Promise.all.bind(Promise);

const pg = postgres({ connectionInfo: pgsqlConfig, path: import.meta.dirname });

flow(fs.readdir('./content'), files =>
	files.forEach(file =>
		flow(
			fs.readFile(join(import.meta.dirname, 'content', file), 'utf8'), //
			text => pg('vectorize', { text })
		)
	)
);
