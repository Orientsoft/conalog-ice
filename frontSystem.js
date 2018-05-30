import Parser from '../lib/Parser'
import { parseString } from 'xml2js'
import fs from 'fs'
import peg from 'pegjs'
import path from 'path'

let FrontMap = require(path.resolve(__dirname, './frontSystem/FrontMap.js')).default
let front_map

let parsers = fs.readFileSync(path.resolve(__dirname, './frontSystem/frontSystem.pegjs'), 'UTF-8')
let notXmlParser = peg.generate(parsers)

const parseTs = (tsString) => {
  let year = new Date().getFullYear()
  let [month, day, timeStr] = tsString.split('-')
  let date = year + '-' + month + '-' + day + ' ' + timeStr
  let ts = new Date(date).getTime()
  return ts
}

const parseMsg = (msg) => {
  let result = {}
  let output = notXmlParser.parse(msg).content
  for (let key in output) {
    let item = output[key]
    let key = item.key
    let value = item.value
    result[key] = value
  }
  return result
}

let messageHandler = (parser, channel, message) => {
  let [ts, a, b, process, log, action, payload] = message.split('|')
  ts = ts.split(' ')[0]
  if (payload.indexOf("接收通讯报文完成") != -1) {
    if (!front_map.lookup(process)) {
      let startmsg = {
        startTime: ts,
        msg: {},
      }
      front_map.add(process, startmsg)
    }

  } else if (payload.indexOf("发送通讯报文:") != -1) {
		
    let msg2 = payload.substring(payload.indexOf('<'), payload.lastIndexOf('>') + 1)
    try {
      let resultSend = parseMsg(msg2)
      if (front_map.lookup(process)) {
        front_map.add(process, resultSend)
      }
    } catch (err) {
      parser.sendError(msg2, 'messageHandler()', { message: 'Failed to parse 发送通讯报文', err })
    }

  } else if (payload.indexOf("收到通讯报文:") != -1) {

    let msg3 = payload.substring(payload.indexOf('<'), payload.lastIndexOf('>') + 1)
    try {
      let resultrec = parseMsg(msg3)
      if (front_map.lookup(process)) {
        front_map.add(process, resultrec)
      }
    } catch (err) {
      parser.sendError(msg3, 'messageHandler()', { message: 'Failed to parse 收到通讯报文', err })
    }

  } else if (payload.indexOf("交易处理完成") != -1) {

    try {
      let all = front_map.get(process).data
      let startTime = all.startTime
      let endTime = ts
      let result = all.msg
      let duration = parseTs(endTime) - parseTs(startTime)
			result['startTime'] = startTime
      result['endTime'] = endTime
      result['duration'] = duration
      result['process'] = process
			console.log('all', result)
      parser.sendResult(result)
			front_map.delete(process)
    } catch (err) {
      parser.sendError(payload, 'messageHandler()', { message: 'Failed to send ', err })
    }
    
  }
}

let front = new Parser(messageHandler)
front_map = new FrontMap(front)
front.start()

