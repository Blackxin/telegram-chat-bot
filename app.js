const Telegraf = require('telegraf')
const { token, i18n } = require('./config')
const { Markup } = Telegraf

const app = new Telegraf(token)
const db = { chat: {}, search: [] }

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

app.command('start', ({ reply }) => {
  return reply('Чтобы начать поиск, нажми кнопку.', Markup
    .keyboard([
      i18n.connect
    ])
    .resize()
    .oneTime()
    .extra()
  )
})

app.hears(i18n.disconnect, ({ from, reply, telegram }) => {
  if (db.chat[from.id] && db.chat[db.chat[from.id]]) {
    telegram.sendMessage(db.chat[from.id], 'Собеседник отключился.', Markup
      .keyboard([
        i18n.connect
      ])
      .resize()
      .oneTime()
      .extra()
    )

    delete db.chat[db.chat[from.id]]
    delete db.chat[from.id]

    return reply('Собеседник удален.', Markup
      .keyboard([
        i18n.connect
      ])
      .resize()
      .oneTime()
      .extra()
    )
  } else {
    return reply('Собеседник не найден.', Markup
      .keyboard([
        i18n.connect
      ])
      .resize()
      .oneTime()
      .extra()
    )
  }
})

app.hears(i18n.connect, ({ from, reply, telegram }) => {
  if (db.search.indexOf(from.id) === -1) {
    db.search.push(from.id)
  }

  if (db.chat[from.id]) {
    telegram.sendMessage(db.chat[from.id], 'Собеседник отключился.', Markup
      .keyboard([
        i18n.connect
      ])
      .resize()
      .oneTime()
      .extra()
    )

    delete db.chat[db.chat[from.id]]
    delete db.chat[from.id]
  }

  const ids = db.search.filter(id => id !== from.id)
  const companion = ids[random(0, ids.length - 1)]

  if (companion) {
    db.chat[from.id] = companion
    db.chat[companion] = from.id

    delete db.search[db.search.indexOf(from.id)]
    delete db.search[db.search.indexOf(db.chat[from.id])]

    reply('Собеседник найден.', Markup
      .keyboard([
        i18n.disconnect
      ])
      .resize()
      .oneTime()
      .extra()
    )

    return telegram.sendMessage(db.chat[from.id], 'Собеседник найден.', Markup
      .keyboard([
        i18n.disconnect
      ])
      .resize()
      .oneTime()
      .extra()
    )
  }

  return reply('Поиск собеседника...')
})

app.on('message', ({ message, from, reply, telegram }) => {
  console.log(message)

  if (db.chat[from.id] && db.chat[db.chat[from.id]]) {
    if (message.text) {
      return telegram.sendMessage(db.chat[from.id], message.text)
    } else if (message.voice) {
      return telegram.sendVoice(db.chat[from.id], message.voice.file_id)
    } else if (message.photo) {
      return telegram.sendPhoto(db.chat[from.id], message.photo.file_id)
    } else if (message.document) {
      return telegram.sendDocument(db.chat[from.id], message.document.file_id)
    } else if (message.video) {
      return telegram.sendVideo(db.chat[from.id], message.video.file_id)
    } else if (message.video_note) {
      return telegram.sendVideoNote(db.chat[from.id], message.video_note.file_id)
    } else if (message.location) {
      return telegram.sendLocation(db.chat[from.id], message.location.latitude, message.location.longitude)
    } else if (message.contact) {
      return telegram.sendContact(db.chat[from.id], message.contact.phone_number, message.contact.first_name, message.contact.last_name)
    }
  } else {
    return reply('Собеседник не найден. Нажмите, чтобы найти.', Markup
      .keyboard([
        i18n.connect
      ])
      .resize()
      .oneTime()
      .extra()
    )
  }
})

app.startPolling()
