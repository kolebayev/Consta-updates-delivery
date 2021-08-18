const releaseSeparator = '--------------------'
const changeLogSeparator = '---'
const versionReg =
  /\#\#\ v([0-9]+\.[0-9]+\.[0-9]+)\ \(([0-9]+\/.[0-9]+\/[0-9]+)\)/m
const messageLength = 4090

const getReleaseBody = (release) => {
  return release
    .replace('# Changelog\n\n', '')
    .replace(versionReg, '')
    .replace('\n\n', '')
}

const getVersion = (release) => {
  const [full, version, date] = release.match(versionReg)
  return [version, date]
}

const getLastReliase = (body) => body.split(releaseSeparator)[0]

const getHeader = (libName, version, date) =>
  `Новая версия \`${libName}\`\n**v${version} (${date})**`

const getFooter = (releaseUrl, version) =>
  `\n[открыть в GitHub](${releaseUrl}v${version})`

const parseBody = (body) => {
  const parse = body.split(changeLogSeparator)
  const text = parse[0] && parse[0].trim()
  const commits = parse[1] && parse[1].trim()

  if (text && commits) {
    return [text, commits]
  }

  return [undefined, text]
}

const getTextMessage = (libName, version, date, body, releaseUrl) => {
  const header = getHeader(libName, version, date)
  const footer = getFooter(releaseUrl, version)
  const parsedBody = parseBody(body)

  let text = `${header}\n\n${
    parsedBody[0] ? `${parsedBody[0]}\n\n` : ''
  }Список изменений:\n`

  const commits = parsedBody[1].split('\n').filter((item) => item.length)

  for (let i = 0; i < commits.length; i++) {
    const string = `${commits[i]}\n`

    if (text.length + string.length + footer.length <= messageLength) {
      text += string
    } else {
      break
    }
  }

  text += footer

  return text
}

module.exports = {
  releaseSeparator,
  changeLogSeparator,
  getLastReliase,
  getTextMessage,
  getReleaseBody,
  getVersion,
}
