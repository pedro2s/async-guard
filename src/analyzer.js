import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import fs from 'fs/promises';

const traverse = traverseModule.default;

export async function analyzeFile(filePath) {
	const content = await fs.readFile(filePath, 'utf-8');
	const problems = [];

	try {
		const ast = parse(content, {
			sourceType: 'module',
			plugins: ['topLevelAwait'],
		});

		traverse(ast, {
			FunctionDeclaration(path) {
				if (path.node.async && !hasTryCatch(path.node.body)) {
					problems.push(
						makeProblem(
							'Async function without try/catch',
							filePath,
							path.node.loc,
							path.toString(),
						),
					);
				}
			},
			FunctionExpression(path) {
				if (path.node.async && !hasTryCatch(path.node.body)) {
					problems.push(
						makeProblem(
							'Async anonymous function without try/catch',
							filePath,
							path.node.loc,
							path.toString(),
						),
					);
				}
			},
			AwaitExpression(path) {
				if (!isInsideTryCatch(path)) {
					problems.push(
						makeProblem(
							'Await expression outside of try/catch',
							filePath,
							path.node.loc,
							path.toString(),
						),
					);
				}
			},
			CallExpression(path) {
				const callee = path.node.callee;
				if (
					callee.type === 'MemberExpression' &&
					callee.property.name === 'then' &&
					!hasCatch(path)
				) {
					problems.push(
						makeProblem(
							'Promise .then() without .catch()',
							filePath,
							path.node.loc,
							codeFromPath(path),
						),
					);
				}
			},
			NewExpression(path) {
				if (path.node.callee.name === 'Promise') {
					const callback = path.node.arguments[0];
					if (callback && callback.type === 'ArrowFunctionExpression') {
						const rejects = findRejectCalls(callback.body);
						if (rejects.length > 0) {
							problems.push(
								makeProblem(
									'Promise constructor without try/catch',
									filePath,
									path.node.loc,
									codeFromPath(path),
								),
							);
						}
					}
				}
			},
		});
	} catch (error) {
		problems.push({
			message: 'Error parsing file',
			file: filePath,
			error: error.message,
		});
	}

	return problems;
}

function hasTryCatch(body) {
	return body.body.some((node) => node.type === 'TryStatement');
}

function isInsideTryCatch(path) {
	return path.findParent((p) => p.isTryStatement()) !== null;
}

function makeProblem(message, file, loc, snippet) {
	return {
		message,
		file,
		location: loc,
		codeSnippet: snippet,
	};
}

function hasCatch(path) {
	let current = path;
	while (current.parentPath) {
		if (
			current.parentPath.node.type === 'CallExpression' &&
			current.parentPath.node.callee.property?.name === 'catch'
		) {
			return true;
		}
		current = current.parentPath;
	}
	return false;
}

function findRejectCalls(body) {
	const rejects = [];
	if (body.type === 'BlockStatement') {
		body.body.forEach((statement) => {
			if (
				statement.type === 'ExpressionStatement' &&
				statement.expression.type === 'CallExpression' &&
				statement.expression.callee.name === 'reject'
			) {
				rejects.push(statement);
			}
		});
	}
	return rejects;
}

function codeFromPath(path) {
	try {
		return path.toString();
	} catch {
		return '[code not available]';
	}
}
