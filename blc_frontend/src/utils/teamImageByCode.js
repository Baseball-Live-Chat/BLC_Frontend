// src/utils/teamImageByCode.js
const TEAM_IMAGE_MAP = {
  키움: 'kiwoom.png',
  두산: 'doosan.png',
  롯데: 'lotte.png',
  SSG: 'ssg.png',
  KT: 'kt.png',
  삼성: 'samsung.png',
  KIA: 'kia.png',
  NC: 'nc.png',
  LG: 'lg.png',
  한화: 'hanwha.png',
}

export function getTeamImageByCode(teamCode) {
  const filename = TEAM_IMAGE_MAP[teamCode] || 'default.png'
  return `/images/teams/${filename}`
}
