#!/usr/bin/env node
import meow from "meow"
import arrify from "arrify"
import chalk from "chalk"
import purposefile from "./"

let cli = meow({
	help: `
    Usage
			purposefile [...patterns]

    Examples
      $ purposefile
      $ purposefile '**'
      $ purposefile path/to/file path/to/other/file
	`,
	flags: {
		ignore: {
			type: "string",
			alias: "i",
		},
	},
})

let search = cli.input.length ? cli.input : undefined
let ignore = arrify(cli.flags.ignore)

purposefile({
	cwd: process.cwd(),
	search,
	inverse: !!search,
	ignore,
})
	.then(results => {
		if (process.stdout.isTTY && !search && results.length) {
			console.log(
				chalk.red.bold("The following files have no known purpose:") + "\n",
			)
		}

		for (let result of results) {
			if (result.purpose) {
				console.log(
					`${chalk.cyan(result.file)} ${chalk.dim(result.purpose || "")}`,
				)
			} else {
				console.log(`${chalk.red(result.file)}`)
			}
		}

		if (process.stdout.isTTY && !search && results.length) {
			console.log(
				"\n" +
					chalk.red.bold(
						"You either need to delete these files or update the .purposefile",
					),
			)
			process.exit(1)
		}

		if (!search && !results.length) {
			console.log(
				chalk.green.bold("Every file in this repo has a known purpose"),
			)
		}
	})
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
