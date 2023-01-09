# Door43 Library Page Code

## Priority #1 - User-friendly Library Page

Target location: [https://door43.org/en/library](https://door43.org/library)

Testing location: [https://door43-library.netlify.aoo](https://door43-library.netlify.aoo)

#### Formats for download:

* PDF
* DOCX
* ODT
* EPUB
* MD
* MP3 (high and low quality) (individual files and zip)
* MP4 (high and low quality) (individual files and zip)
* 3GP

#### User interface recommendations

See http://door43-library.netlify.app/ for an example

* Use world map to separate languages by continent for natural, easy discovery by end-users.
* Use accordion to show/hide resources per language
* Keep alignment of language and its resources compact, not spread across entire page or taking up lots of screen real estate (i.e. the current uW OBS page is consistently reported as confusing and not user friendly)
* Include file size information so users can gauge their ability to download and therefore choose the optimal time or format. 


## Developing: Quckstart (see below for details)

`clone git@github.com:unfoldingWord/door43-library.git`

`cd door43-library`

`npm i`

`npm run build && npm start`

To quickly only compile changes:

`npm run build-d43 && run start`

##### Install node.js:

  You can install nodejs and npm easily with apt install, just run the following commands on Ubuntu.

```
  $ sudo apt install nodejs
  $ sudo apt install npm
```

  or with brew on Mac:

```
  $ brew install nodejs
  $ brew install npm
```

  For other OSs, go to the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/)

#### Load the dependencies:

```
  $ cd door43-library
  $ npm ci
```

If you modify the package.json file to add/update dependencies, run:

```
  $ npm install
```

#### Edit the source files:

  Edit the files in the `src/` directory.

### To Build:

  Build by running:

```
  $ npm run build
```

  This will build the minified js and css files in the `build/` directory.

### To View the Door43 Library Page Locally:

  Run the following to get the http-server going on port 8081:

```
  $ npm start
```

  and go to [http://127.0.0.1:8080](http://127.0.0.1:8080).

  If you need it to run on a different port, just run, for example:

```
  $ npm start --port=8888
```

  where `8888` is the port that will be used, and [http://127.0.0.1:8888](http://127.0.0.1:8888) is where you can view the html page.

  **NOTE:** This uses the production OBS Catalog file at [https://api.door43.org/v3/subjects/Open_Bible_Stories.json](https://api.door43.org/v3/subjects/Open_Bible_Stories.json). If you need to use a local copy of the JSON file, you need to put it in the `build/` directory make the following change at [src/ts/door43-library-start.ts#L37](src/ts/door43-library-start.ts#L37):

  Change
```
    let obs: OBS = new OBS('https://api.door43.org/v3/subjects/Open_Bible_Stories.json', function() {
```
  to
```
    let obs: OBS = new OBS('/Open_Bible_Stories.json', function() {
```
(that is, remove `https://api.door43.org/v3/subjects`) and then run the build command again.

               **PLEASE REMEMBER TO CHANGE IT BACK BEFORE COMMITTING YOUR CHANGES!!!**

### To Run Unit Tests:

  To run the unit tests, using karma, run:

```
  $ npm run test
```

  Add your tests to the js files in the `test/js/` directory.

## Production build and Deployment on Netlify

  Building for production can be done using the --only=prod argument with npm:

```
  $ npm install --only=prod
```

  This will install the minimal number of packages needed for the build:

```
  $ npm run build
```

  The `output/` directory has the production files, where `build/index.html` is an example of what can be placed at [https://openbiblestories.org/library](https://openbiblestories.org/library).

  When the `develop` branch is updated for the [https://www.github.com/unfoldingword-dev/door43-library](https://www.github.com/unfoldingword-dev/door43-library) repo, it will automatically be built at [https://door43-library.netlify.app](https://door43-library.netlify.app). The JS and CSS files can then be used elsewhere, such as on squarespace.com by linking them as follows:

```
<link data-preserve-html-node="true" rel="stylesheet" href="https://door43-library.netlify.app/css/map-style.min.css" type="text/css" media="all">
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
<script data-preserve-html-node="true" type="text/javascript" src="https://use.fontawesome.com/ac6410a9c6.js"></script>
<script data-preserve-html-node="true" type="text/javascript" src="https://door43-library.netlify.app/js/strings.min.js"></script>
<script data-preserve-html-node="true" type="text/javascript" src="https://door43-library.netlify.app/js/region_data.min.js"></script>
<script data-preserve-html-node="true" type="text/javascript" src="https://door43-library.netlify.app/js/map_data.min.js"></script>
<script data-preserve-html-node="true" type="text/javascript" src="https://door43-library.netlify.app/js/map_interactive.min.js"></script>
<script data-preserve-html-node="true" type="text/javascript" src="https://door43-library.netlify.app/js/door43-library.js"></script>
<script data-preserve-html-node="true" type="text/javascript" src="https://door43-library.netlify.app/js/door43-library-start.js"></script>
<div data-preserve-html-node="true" id="clickable-map"></div>
<div data-preserve-html-node="true" id="published-languages"><center><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
<span class="sr-only">Loading...</span><br/>Loading...</center></div>
```

 Live example at: [https://door43-library.netlify.app/prod_example.html](https://door43-library.netlify.app/prod_example.html)

## Other Documentation & Links

  * [http://api-info.readthedocs.io/en/latest/door43.html](http://api-info.readthedocs.io/en/latest/door43.html)
  * [https://api.door43.org/v3/subjects/Open_Bible_Stories.json](https://api.door43.org/v3/subjects/Open_Bible_Stories.json)
  * [https://api.door43.org/v3/catalog.json](https://api.door43.org/v3/catalog.json) 
  * [https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes/blob/master/all/all.csv](https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes/blob/master/all/all.csv)
  * [https://www.netlify.com/](https://www.netlify.com/)
