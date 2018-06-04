#!/usr/bin/env node
const chat = require('.')
const args = process.argv.slice(2)
const port = args[0]
const user = args[1]
const pass = args[2]

chat.run(port, user, pass)
