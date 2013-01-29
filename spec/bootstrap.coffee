chai = require 'chai'
global.expect = chai.expect
chai.Assertion.includeStack = true

global.jQuery = require 'jquery'
# global.Spy = require './spy/spy'
# chai.use require './chai-jquery/chai-jquery.js'
# chai.use require './spy/spy.chai'
# chai.use require './chai-extensions.js'

global.requirejs = requirejs = require 'requirejs'
require './configure-require.js'

# the text module is loaded here so that it can
# properly sense out the node environment before
# we add in the fake dom from jsdom
# requirejs 'text'
# global.createWindow = ->
#   (require 'jsdom').jsdom().createWindow()
# global.window = global.createWindow()
# global.document = global.window.document
# require './window-modifications.js'
# requirejs 'lib/polyfills'

# require './configure-isolate.js'

# fs = require 'fs'
# fs.readdirSync("#{__dirname}/spec-helpers").forEach (file)->
#   if file.indexOf('.js') > -1
#     require "#{__dirname}/spec-helpers/#{file}"
global.define = requirejs
