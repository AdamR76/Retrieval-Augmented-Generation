import Anthropic from '@anthropic-ai/sdk';
import apiKey from './apikey.mjs';
import fs from 'fs/promises';
import pgsqlConfig from './pgsql.config.mjs';
import postgres from '../coding/postgres.mjs';
const flow = (...args) => args.reduce((prev, next) => Promise.resolve(prev).then(next)),
	waitAll = Promise.all.bind(Promise);

const api = apiKey;

const [, , prompt] = process.argv;

const pg = postgres({ connectionInfo: pgsqlConfig, path: import.meta.dirname });

const anthropic = new Anthropic({
	apiKey: api, // defaults to process.env["ANTHROPIC_API_KEY"]
});

const defPrompt = (deftext, vector) =>
	`Using only the vector data below, answer the following question in an article that is at least 500 words: ${deftext} ${vector}`;

const msg = content =>
	anthropic.messages.create({
		model: 'claude-3-5-sonnet-20241022',
		max_tokens: 5000,
		messages: [{ role: 'user', content: content }],
	});

flow(
	pg('getranks', { prompt }),
	data => {
		let content = '';
		for (let idx = 0; idx < data.length; idx++) {
			content += data[idx].rag;
		}
		return content;
	},
	content => msg(defPrompt(prompt, content)),
	res => {
		const { text } = res.content[0];
		return fs.writeFile(`${prompt}.txt`, text, 'utf8')
	}
);
