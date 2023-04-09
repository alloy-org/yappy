# Yappy

Yappy is an [Amplenote plugin](https://www.amplenote.com/help/developing_amplenote_plugins) that implements 
AI functionality desired by its author. 

Initially, Yappy was developed only within its note in Amplenote, but there were a few benefits to extracting 
it to this git repo:

* When its syntax is incorrect, the IDE can highlight specifically *where* it's wrong
* It can be tested with unit tests
* It will allow GitClear to track how it evolves over time
* It can be used as a template for other Amplenote plugins?

So here we are.

## Installation

Clone this repo. Install node and npm if you haven't already. Run `npm install` to install the packages.  

## Testing

Run `npm test` to run the tests.

### Run tests continuously as modifying the plugin

```bash
npm run test -- --watch
```

## Technologies used to help with this project

* https://esbuild.github.io/getting-started/#your-first-bundle
* https://jestjs.io/
* https://www.gitclear.com
