#!/usrc/bin/env node
import { analyzeFile } from './analyzer.js';
import { globby } from 'globby';
import chalk from 'chalk';
import path from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
	console.error(chalk.red('Please provide a file or directory to analyze.'));
	process.exit(1);
}

const resolvedArgs = args.map((p) => path.resolve(process.cwd(), p));

// Use o diretório pai comum como cwd do globby
const globCwd = path.dirname(resolvedArgs[0]);

// Caminhos relativos ao cwd do globby
const globArgs = resolvedArgs.map((p) => path.relative(globCwd, p).split(path.sep).join(path.posix.sep));

const paths = await globby(globArgs, {
	cwd: globCwd,
	absolute: true,
	expandDirectories: {
		extensions: ['js'],
	},
	gitignore: true,
});

let totalProblems = 0;

for (const file of paths) {
	const problems = await analyzeFile(file);

	for (const p of problems) {
		console.log(`\n${chalk.yellow('[WARNING]')} ${chalk.bold(p.message)}`);
		console.log(`${chalk.cyan('File:')} ${file}`);
		if (p.location) {
			console.log(`Line ${p.location.start.line}, Column ${p.location.start.column}`);
		}
		if (p.codeSnippet) {
			console.log(chalk.gray(indent(p.codeSnippet, 2)));
		}
		totalProblems++;
	}
}

if (totalProblems === 0) {
	console.log(chalk.green('\nNo problems found.'));
} else {
	console.log(chalk.redBright(`\nFound ${totalProblems} problems.`));
	process.exit(1);
}

function indent(str, spaces = 2) {
	return str
		.split('\n')
		.map((line) => ' '.repeat(spaces) + line)
		.join('\n');
}
