const _ = require("lodash");
const path = require("path");
const chalk = require("chalk");
const yosay = require("yosay");
const mkdirp = require("mkdirp");
const simpleGit = require("simple-git");
const shell = require("shelljs");

const YeomanGenerator = require("yeoman-generator");

const NEW_LINE = "\n";

module.exports = class WebAppGenerator extends (
	YeomanGenerator
) {
	constructor() {
		super(...arguments);

		this.package = {};

		this.copy = (input, output) => {
			this.fs.copy(
				this.templatePath(input),
				this.destinationPath(output),
			);
		};

		this.copyTpl = (input, output, data) => {
			this.fs.copyTpl(
				this.templatePath(input),
				this.destinationPath(output),
				data,
			);
		};

		this.npmAuthor = () => {
			if (shell.which("npm")) {
				const name = shell
					.exec("npm config get init-author-name", { silent: true })
					.stdout.trim();
				const email = shell
					.exec("npm config get init-author-email", { silent: true })
					.stdout.trim();

				return { name, email };
			}

			return "";
		};
	}

	initializing() {
		this.props = {};

		this.log(
			yosay(
				chalk.cyan.bold(
					"Hello, and welcome to my fantastic generator full of whimsy and bubble gum!",
				),
				{
					maxLength: 50,
				},
			),
		);
	}

	prompting() {
		return this.prompt([
			{
				type: "input",
				name: "name",
				message: chalk.red("Your Project Name: "),
				default: path.basename(process.cwd()),
			},
			{
				type: "input",
				name: "description",
				message: chalk.red("Project Description: "),
				default: "A simple app description",
			},
			{
				type: "confirm",
				name: "git",
				message: chalk.red("Do you want to enable git as well?"),
				default: false,
			},
		]).then((props) => {
			_.merge(this.props, props, {
				createDir: props.name !== path.basename(process.cwd()),
			});
		});
	}

	default() {
		this.log(chalk.red(_.repeat("-", 80)));

		if (this.props.createDir) {
			this.log(
				`${chalk.green(
					this.props.name,
				)} does not exist.${NEW_LINE}I'll automatically create this folder.`,
			);
			mkdirp(this.props.name);
			this.destinationRoot(this.destinationPath(this.props.name));
		}

		if (this.props.git) {
			const git = simpleGit({
				baseDir: this.destinationRoot(),
				binary: "git",
				maxConcurrentProcesses: 4,
			});

			return git.init().then(() => {
				this.log("Git init done");
			});
		}
	}

	writing() {
		const packageData = {};
		const pkgJSON = this.fs.readJSON(
			this.destinationPath("package.json"),
			{},
		);

		_.extend(
			packageData,
			{
				name: this.props.name,
				description: this.props.description,
				version: "0.1.0",
				scripts: {
					start: "gulp",
				},
				keywords: [],
				license: "ISC",
			},
			{
				author: this.npmAuthor(),
			},
			pkgJSON,
		);

		this.fs.writeJSON(this.destinationPath("package.json"), packageData);

		if (this.props.git) {
			this.copy("gitignore", ".gitignore");
		}

		this.copy("index.html", "app/index.html");
		this.copy("scss", "app/scss");
		this.copy("js", "app/js");
		this.copy("images", "images");

		this.copy("config.ini", "config.ini");
		this.copy("gulpfile.js", "gulpfile.js");
	}

	install() {
		this.npmInstall(
			[
				"browser-sync",
				"cssnano",
				"del",
				"fancy-log",
				"gulp",
				"gulp-htmlmin",
				"gulp-postcss",
				"gulp-sass",
				"gulp-terser",
				"ini",
				"lodash.get"
			],
			{ "save-dev": true },
		);
		this.npmInstall(["normalize.css"], { save: true });
	}

	end() {
		if (this.props.git) {
			const git = simpleGit({
				baseDir: this.destinationRoot(),
				binary: "git",
				maxConcurrentProcesses: 4,
			});

			return git.add("./*").commit("setup complete");
		}
	}
};
